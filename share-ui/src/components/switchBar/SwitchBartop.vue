<template>
  <div class="switch-bar-top">
    <div class="switch-container">
      <div
        v-for="(item, index) in switchOptions"
        :key="index"
        :class="['switch-item', { active: activeIndex === index }]"
        @click="handleSwitch(index)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  options: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: [String, Number],
    default: 0
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const switchOptions = computed(() => {
  return props.options.map(item => {
    if (typeof item === 'string') {
      return { label: item, value: item }
    }
    return item
  })
})

const activeIndex = computed(() => {
  const value = props.modelValue
  return switchOptions.value.findIndex(item => item.value === value)
})

const handleSwitch = (index) => {
  const option = switchOptions.value[index]
  emit('update:modelValue', option.value)
  emit('change', option.value, option)
}
</script>

<style scoped>
.switch-bar-top {
  width: 100%;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 16px;
}

.switch-container {
  display: flex;
  height: 40px;
  line-height: 40px;
}

.switch-item {
  flex: 1;
  text-align: center;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  transition: all 0.3s;
  color: #606266;
}

.switch-item.active {
  background-color: #409eff;
  color: white;
}

.switch-item:hover:not(.active) {
  background-color: #ecf5ff;
  color: #409eff;
}
</style>