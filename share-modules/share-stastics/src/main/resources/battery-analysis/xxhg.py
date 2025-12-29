import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt

# 1. 加载数据 (模拟刚才生成的100条数据逻辑)
# 为了演示，我直接生成这100条数据的数值版
np.random.seed(42)
cycles = np.linspace(10, 330, 100) # 充放电次数
temp = np.linspace(12, 55, 100) + np.random.normal(0, 2, 100) # 环境温度
# 模拟电池量：随次数增加下降，随温度升高加速下降
battery_health = 1.0 - (cycles * 0.0012) - (temp * 0.0005) + np.random.normal(0, 0.01, 100)

data = pd.DataFrame({
    'Cycles': cycles,
    'Temp': temp,
    'Health': battery_health
})

# 2. 准备特征 (X) 和 标签 (y)
X = data[['Cycles', 'Temp']]
y = data['Health']

# 3. 创建并训练模型
model = LinearRegression()
model.fit(X, y)

# 4. 获取拟合结果
w1, w2 = model.coef_
b = model.intercept_
r2 = model.score(X, y)

print(f"--- 拟合结果 ---")
print(f"拟合方程: Health = {w1:.6f} * Cycles + {w2:.6f} * Temp + {b:.4f}")
print(f"判定系数 (R²): {r2:.4f}  (越接近1表示拟合越精确)")

# 5. 可视化：充放电次数与电池量的关系
plt.rcParams['font.sans-serif'] = ['SimHei'] # 显示中文
plt.figure(figsize=(10, 6))
plt.scatter(data['Cycles'], data['Health'], color='blue', alpha=0.5, label='实际观测数据')
plt.plot(data['Cycles'], model.predict(X), color='red', linewidth=2, label='拟合回归线')
plt.xlabel('充放电次数')
plt.ylabel('电池量 (健康度 SOH)')
plt.title('电池健康度随充放电次数退化拟合图')
plt.legend()
plt.grid(True)
plt.show()