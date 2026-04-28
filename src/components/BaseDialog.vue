<!-- components/BaseDialog.vue -->
<template>
    <el-dialog
      v-model="visible"
      :title="title"
      :width="width"
      :fullscreen="fullscreen"
      :top="top"
      :modal="modal"
      :lock-scroll="lockScroll"
      :custom-class="customClass"
      :open-delay="openDelay"
      :close-delay="closeDelay"
      :close-on-click-modal="closeOnClickModal"
      :close-on-press-escape="closeOnPressEscape"
      :show-close="showClose"
      :draggable="draggable"
      :center="center"
      :align-center="alignCenter"
      :destroy-on-close="destroyOnClose"
      @open="handleOpen"
      @opened="handleOpened"
      @close="handleClose"
      @closed="handleClosed"

    >
      <!-- 默认插槽 -->
      <slot></slot>

      <!-- 底部按钮区域 -->
      <template #footer v-if="showFooter">
        <slot name="footer">
          <span class="dialog-footer">
            <el-button @click="visible = false" v-if="showCancelButton">
              {{ cancelButtonText }}
            </el-button>
            <el-button
              type="primary"
              @click="handleConfirm"
              :loading="confirmLoading"
              v-if="showConfirmButton"
            >
              {{ confirmButtonText }}
            </el-button>
          </span>
        </slot>
      </template>
    </el-dialog>
  </template>

  <script setup>
  import { ref, watch } from 'vue'

  const props = defineProps({
    // 基本属性
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '提示' },
    width: { type: [String, Number], default: '50%' },
    fullscreen: { type: Boolean, default: false },
    top: { type: String, default: '15vh' },
    modal: { type: Boolean, default: true },
    lockScroll: { type: Boolean, default: true },
    customClass: { type: String, default: '' },
    openDelay: { type: Number, default: 0 },
    closeDelay: { type: Number, default: 0 },
    closeOnClickModal: { type: Boolean, default: false },
    closeOnPressEscape: { type: Boolean, default: true },
    showClose: { type: Boolean, default: true },
    draggable: { type: Boolean, default: false },
    center: { type: Boolean, default: false },
    alignCenter: { type: Boolean, default: false },
    destroyOnClose: { type: Boolean, default: false },

    // 底部按钮配置
    showFooter: { type: Boolean, default: true },
    showCancelButton: { type: Boolean, default: true },
    showConfirmButton: { type: Boolean, default: true },
    cancelButtonText: { type: String, default: '取消' },
    confirmButtonText: { type: String, default: '确定' },
    confirmLoading: { type: Boolean, default: false },

    // 其他
    closeOnConfirm: { type: Boolean, default: false } // 点击确定后是否自动关闭
  })

  const emit = defineEmits([
    'update:modelValue',
    'open',
    'opened',
    'close',
    'closed',
    'confirm'
  ])

  const visible = ref(false)

  // 同步 v-model
  watch(() => props.modelValue, (val) => {
    visible.value = val
  })

  watch(visible, (val) => {
    emit('update:modelValue', val)
  })

  // 事件处理
  const handleOpen = () => emit('open')
  const handleOpened = () => emit('opened')
  const handleClose = () => emit('close')
  const handleClosed = () => emit('closed')

  const handleConfirm = () => {
    emit('confirm')
    if (props.closeOnConfirm) {
      visible.value = false
    }
  }

  // 暴露方法
  defineExpose({
    open: () => visible.value = true,
    close: () => visible.value = false
  })
  </script>

  <style scoped>
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
  </style>