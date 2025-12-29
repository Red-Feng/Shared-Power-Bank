<template>
  <div class="no-data-container">
    <div class="no-data-content">
      <el-empty description="暂无数据" />
    </div>
  </div>
</template>

<script setup>
// 暂无数据组件
</script>

<style scoped>
.no-data-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.no-data-content {
  text-align: center;
}
</style>