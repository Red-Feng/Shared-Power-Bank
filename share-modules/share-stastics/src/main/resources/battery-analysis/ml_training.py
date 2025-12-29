#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
电池健康度机器学习模型训练脚本
包含线性回归和自定义神经网络模型
"""
import pandas as pd
import numpy as np
import json
import sys
import os
from collections import OrderedDict

# 尝试导入 sklearn，如果失败则使用手动实现
try:
    from sklearn.linear_model import LinearRegression
    USE_SKLEARN = True
except ImportError:
    USE_SKLEARN = False
    print("警告: sklearn 不可用，将使用手动实现的线性回归")

def extract_numeric_features(data):
    """提取数值特征"""
    feature_columns = ['充放电次数', '环境温度(°C)', '当前电量(%)']
    numeric_data = pd.DataFrame()
    
    for col in data.columns:
        if any(fc in col for fc in ['充放电次数', '环境温度', '当前电量']):
            numeric_data[col] = pd.to_numeric(data[col], errors='coerce')
    
    return numeric_data

def load_battery_data(file_path):
    """加载电池数据"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Excel文件 {file_path} 不存在")
    
    data = pd.read_excel(file_path)
    numeric_features = extract_numeric_features(data)
    
    # 找到电池量列
    label_column = None
    for col in data.columns:
        if '电池量' in col:
            label_column = col
            break
    
    if label_column is None:
        raise ValueError("未找到电池量列")
    
    y = pd.to_numeric(data[label_column], errors='coerce').values
    X = numeric_features.values
    
    # 移除NaN值
    mask = ~(np.isnan(X).any(axis=1) | np.isnan(y))
    X = X[mask]
    y = y[mask]
    
    # 分割训练集和测试集
    n_samples = len(X)
    n_test = int(n_samples * 0.2)
    indices = np.random.permutation(n_samples)
    
    test_indices = indices[:n_test]
    train_indices = indices[n_test:]
    
    X_train, X_test = X[train_indices], X[test_indices]
    y_train, y_test = y[train_indices], y[test_indices]
    
    return X_train, X_test, y_train, y_test

# 手动实现的线性回归
class SimpleLinearRegression:
    def __init__(self):
        self.coef_ = None
        self.intercept_ = None
    
    def fit(self, X, y):
        """训练线性回归模型"""
        X = np.column_stack([np.ones(X.shape[0]), X])  # 添加偏置项
        coef = np.linalg.lstsq(X, y, rcond=None)[0]
        self.intercept_ = coef[0]
        self.coef_ = coef[1:]
        return self
    
    def predict(self, X):
        """预测"""
        return X @ self.coef_ + self.intercept_
    
    def score(self, X, y):
        """计算R²分数"""
        y_pred = self.predict(X)
        ss_res = np.sum((y - y_pred) ** 2)
        ss_tot = np.sum((y - np.mean(y)) ** 2)
        return 1 - (ss_res / ss_tot) if ss_tot != 0 else 0

# 神经网络相关类
def mse(y, t):
    """均方误差"""
    return np.mean((y - t) ** 2)

class AddPower:
    def __init__(self, exponent):
        self.exponent = exponent
        self.x = None
        self.dExponent = None
    
    def forward(self, x):
        self.x = x
        return np.power(x, self.exponent)
    
    def backward(self, dout):
        dx = dout * self.exponent * np.power(self.x, self.exponent - 1)
        self.dExponent = np.sum(dout * np.power(self.x, self.exponent) * np.log(np.maximum(self.x, 1e-10)), axis=0)
        return dx

class Affine:
    def __init__(self, W, b):
        self.W = W
        self.b = b
        self.x = None
        self.dW = None
        self.db = None
    
    def forward(self, x):
        self.x = x
        return x @ self.W + self.b
    
    def backward(self, dout):
        dx = dout @ self.W.T
        self.dW = self.x.T @ dout
        self.db = np.sum(dout, axis=0)
        return dx

class MSE:
    def __init__(self):
        self.y = None
        self.t = None
    
    def forward(self, y, t):
        self.y = y
        self.t = t
        self.loss = mse(y, t)
        return self.loss
    
    def backward(self, dout=1):
        batch_size = self.t.shape[0]
        if len(self.t.shape) == 1:
            t_reshaped = self.t.reshape(-1, 1)
        else:
            t_reshaped = self.t
        dx = (self.y - t_reshaped) / batch_size
        return dx

class BatteryModel:
    def __init__(self, input_size=3, output_size=1, weight_init=0.1):
        self.params = {}
        self.params['exponent'] = np.ones(input_size)
        self.params['W1'] = np.random.randn(input_size, output_size) * weight_init
        self.params['b1'] = np.zeros(output_size)
        
        self.layers = OrderedDict()
        self.layers['AddPower'] = AddPower(self.params['exponent'])
        self.layers['Affine1'] = Affine(self.params['W1'], self.params['b1'])
        self.loss_layer = MSE()
    
    def predict(self, x):
        for layer in self.layers.values():
            x = layer.forward(x)
        return x
    
    def loss(self, x, t):
        y = self.predict(x)
        if len(t.shape) == 1:
            t = t.reshape(-1, 1)
        return self.loss_layer.forward(y, t)
    
    def gradient(self, x, t):
        if len(t.shape) == 1:
            t = t.reshape(-1, 1)
        self.loss(x, t)
        dout = self.loss_layer.backward()
        layers = list(self.layers.values())
        layers.reverse()
        for layer in layers:
            dout = layer.backward(dout)
        
        gradient = {
            'exponent': self.layers['AddPower'].dExponent,
            'W1': self.layers['Affine1'].dW,
            'b1': self.layers['Affine1'].db
        }
        return gradient
    
    def accuracy(self, x, t, threshold=0.1):
        """计算准确率（预测误差在阈值内的比例）"""
        y_pred = self.predict(x)
        if len(t.shape) == 1:
            t = t.reshape(-1, 1)
        errors = np.abs(y_pred - t)
        # 使用相对误差和绝对误差的组合
        relative_errors = errors / (np.abs(t) + 1e-8)  # 避免除零
        # 准确率：绝对误差小于阈值 或 相对误差小于10%
        accuracy = np.mean((errors < threshold) | (relative_errors < 0.1))
        return accuracy
    
    def r2_score(self, x, t):
        """计算R²分数（更合理的评估指标）"""
        y_pred = self.predict(x)
        if len(t.shape) == 1:
            t = t.reshape(-1, 1)
        ss_res = np.sum((t - y_pred) ** 2)
        ss_tot = np.sum((t - np.mean(t)) ** 2)
        if ss_tot == 0:
            return 0.0
        r2 = 1 - (ss_res / ss_tot)
        return float(r2)

def batch_train(model, X_train, y_train, X_test=None, y_test=None, epochs=100, batch_size=100, learning_rate=0.01):
    """批量训练模型"""
    num_samples = X_train.shape[0]
    num_batches = (num_samples + batch_size - 1) // batch_size
    
    history = {
        'train_loss': [],
        'test_loss': [],
        'train_accuracy': [],
        'test_accuracy': []
    }
    
    np.random.seed(42)
    
    for epoch in range(epochs):
        indices = np.random.permutation(num_samples)
        X_train_shuffled = X_train[indices]
        y_train_shuffled = y_train[indices]
        
        epoch_loss = 0
        
        for i in range(num_batches):
            start_idx = i * batch_size
            end_idx = min((i + 1) * batch_size, num_samples)
            
            X_batch = X_train_shuffled[start_idx:end_idx]
            y_batch = y_train_shuffled[start_idx:end_idx]
            
            grads = model.gradient(X_batch, y_batch)
            
            model.params['W1'] -= learning_rate * grads['W1']
            model.params['b1'] -= learning_rate * grads['b1']
            model.params['exponent'] -= learning_rate * grads['exponent']
            
            batch_loss = model.loss(X_batch, y_batch)
            epoch_loss += batch_loss
        
        avg_loss = epoch_loss / num_batches
        history['train_loss'].append(float(avg_loss))
        
        # 使用R²分数作为准确率（更合理的指标）
        train_r2 = model.r2_score(X_train, y_train)
        # 将R²转换为0-1范围的准确率表示
        train_acc = max(0, min(1, train_r2))
        history['train_accuracy'].append(float(train_acc))
        
        if X_test is not None and y_test is not None:
            test_loss = model.loss(X_test, y_test)
            test_r2 = model.r2_score(X_test, y_test)
            # 将R²转换为0-1范围的准确率表示
            test_acc = max(0, min(1, test_r2))
            history['test_loss'].append(float(test_loss))
            history['test_accuracy'].append(float(test_acc))
    
    return history

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python ml_training.py <excel_file_path>")
        sys.exit(1)
    
    excel_file = sys.argv[1]
    
    try:
        # 加载数据
        X_train, X_test, y_train, y_test = load_battery_data(excel_file)
        
        result = {}
        
        # 1. 线性回归
        if USE_SKLEARN:
            lr_model = LinearRegression()
        else:
            lr_model = SimpleLinearRegression()
        
        lr_model.fit(X_train, y_train)
        r2_train = lr_model.score(X_train, y_train)
        r2_test = lr_model.score(X_test, y_test)
        
        result['linear_regression'] = {
            'coefficients': [float(c) for c in lr_model.coef_],
            'intercept': float(lr_model.intercept_),
            'r2_train': float(r2_train),
            'r2_test': float(r2_test),
            'equation': f"Health = {lr_model.coef_[0]:.6f} * Cycles + {lr_model.coef_[1]:.6f} * Temp + {lr_model.intercept_:.4f}"
        }
        
        # 2. 机器学习模型训练
        ml_model = BatteryModel(input_size=X_train.shape[1], output_size=1)
        history = batch_train(ml_model, X_train, y_train, X_test, y_test, epochs=100, batch_size=100, learning_rate=0.01)
        
        # 计算最终的R²分数
        final_train_r2 = ml_model.r2_score(X_train, y_train)
        final_test_r2 = ml_model.r2_score(X_test, y_test) if X_test is not None and len(X_test) > 0 else 0
        
        result['ml_model'] = {
            'history': history,
            'final_train_loss': history['train_loss'][-1],
            'final_test_loss': history['test_loss'][-1],
            'final_train_acc': history['train_accuracy'][-1],
            'final_test_acc': history['test_accuracy'][-1],
            'final_train_r2': float(final_train_r2),
            'final_test_r2': float(final_test_r2)
        }
        
        # 输出JSON结果
        print(json.dumps(result, indent=2, ensure_ascii=False))
        
    except Exception as e:
        error_result = {'error': str(e)}
        print(json.dumps(error_result, indent=2, ensure_ascii=False))
        sys.exit(1)

if __name__ == '__main__':
    main()

