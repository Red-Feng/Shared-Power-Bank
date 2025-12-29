# 电池健康度评估分析

本目录包含电池健康度评估相关的数据分析脚本和资源文件。

## 文件说明

### 1. BatteryData.xlsx
电池数据Excel文件，包含以下字段：
- 充放电次数
- 环境温度
- 当前电量
- 电池量（健康度 SOH）

### 2. BatteryEvaluation.ipynb
Jupyter Notebook 文件，包含完整的电池健康度评估流程：
- 数据加载和预处理
- 自定义神经网络模型（battery_model）
- 模型训练和评估
- 训练历史记录

### 3. xxhg.py
Python 脚本，使用线性回归分析电池健康度：
- 基于充放电次数和环境温度预测电池健康度
- 使用 sklearn 的 LinearRegression 模型
- 生成可视化图表

## 使用方法

### 运行 Python 脚本
```bash
# 安装依赖
pip install pandas numpy scikit-learn matplotlib openpyxl

# 运行线性回归分析
python xxhg.py
```

### 运行 Jupyter Notebook
```bash
# 安装 Jupyter
pip install jupyter notebook

# 启动 Jupyter
jupyter notebook BatteryEvaluation.ipynb
```

## 模型说明

### 线性回归模型（xxhg.py）
- **输入特征**：充放电次数、环境温度
- **输出**：电池健康度（SOH）
- **拟合方程**：`Health = w1 * Cycles + w2 * Temp + b`

### 神经网络模型（BatteryEvaluation.ipynb）
- **网络结构**：AddPower层 + Affine层
- **损失函数**：MSE（均方误差）
- **优化方法**：批量梯度下降

## 注意事项

1. 确保已安装所需的 Python 库
2. Excel 文件路径需要正确配置
3. 如果 sklearn 导入失败，代码会自动使用手动实现的 train_test_split

## 集成说明

这些文件已集成到 `share-device` 模块的资源目录中，可以作为：
- 数据分析参考
- 模型训练脚本
- 数据预处理工具

如需在 Java 项目中调用这些 Python 脚本，可以使用 `ProcessBuilder` 或 `Runtime.exec()` 执行 Python 命令。

