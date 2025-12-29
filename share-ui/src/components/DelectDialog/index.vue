<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="500px"
    :before-close="handleClose"
    append-to-body
  >
    <div class="dialog-content">
      <el-icon class="warning-icon" size="24"><Warning /></el-icon>
      <span>{{ content }}</span>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="danger" @click="handleConfirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Warning } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '删除确认'
  },
  content: {
    type: String,
    default: '此操作将永久删除该记录，是否继续？'
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.dialog-content {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.warning-icon {
  color: #E6A23C;
  margin-right: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>