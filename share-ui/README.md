# node版本 v18.16.1
node -v

#安装yarn  
# Yarn是由Facebook、Google、Exponent 和 Tilde 联合推出发布的一款取代npm的包管理工具
#安装yarn出现问题，可以忽略校验
npm config set strict-ssl false
npm install -g yarn

# 进入项目目录
cd share-ui

# 安装依赖
yarn --registry=https://registry.npmmirror.com

# 启动服务
yarn dev

# 构建测试环境 yarn build:stage
# 构建生产环境 yarn build:prod