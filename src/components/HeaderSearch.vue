<template>
  <div class="advanced-search-container" :class="{ 'is-expanded': expanded }">
    <div class="contaniner-layou":style="{'width':searchWidth}">
      <el-form
      ref="formRef"
      :model="searchParams"
      :inline="inline"
      :label-width="labelWidth"
      :label-position="labelPosition"
      @submit.prevent="handleSearch"
      style="width: 100%;"
    >
      <el-row :gutter="24">
        <template v-for="(item, index) in visibleItems" :key="index">
          <el-col  :span="rowSpan":style="collapseStyle">
            <el-form-item
              :label="item.label"
              :prop="item.prop"
              :rules="item.rules"
              :class="['search-item', { 'full-width': item.fullWidth }]"
            >
              <!-- 输入框 -->
              <el-input
                v-if="item.type === 'input' || !item.type"
                v-model="searchParams[item.prop]"
                :placeholder="item.placeholder || `请输入${item.label}`"
                :clearable="item.clearable !== false"
                :show-password="item.showPassword"
                :disabled="item.disabled"
                :maxlength="item.maxlength"
                @clear="handleClear(item)"
                @keyup.enter="handleSearch"
              >
                <template #prepend v-if="item.prepend">
                  {{ item.prepend }}
                </template>
                <template #append v-if="item.append">
                  {{ item.append }}
                </template>
              </el-input>

              <!-- 数字输入框 -->
              <el-input-number
                v-else-if="item.type === 'number'"
                v-model="searchParams[item.prop]"
                :min="item.min"
                :max="item.max"
                :step="item.step"
                :controls-position="item.controlsPosition"
                :placeholder="item.placeholder || `请输入${item.label}`"
                @change="handleSearch"
              />

              <el-tree-select
              v-else-if="item.type === 'el-tree-select'"
                v-model="searchParams[item.prop]"
                :data="item.options"
                :props="item.defaultProps"
                node-key="id"
                ref="treeRef"
                :placeholder="item.placeholder || `请输入${item.label}`"
                :style="{ Width: item.width + 'px' }"
                multiple
                :show-checkbox="item.showCheckbox"
                :check-strictly="false"
                :default-expand-all="item.defaultExpandAll || true"
                @change="handleSelectChange(item)"

              />


              <!-- 下拉选择 -->
              <el-select
                v-else-if="item.type === 'select'"
                v-model="searchParams[item.prop]"
                :placeholder="item.placeholder || `请选择${item.label}`"
                :multiple="item.multiple"
                :filterable="item.filterable"
                :remote="item.remote"
                :remote-method="item.remoteMethod"
                :loading="item.loading"
                :clearable="item.clearable !== false"
                :disabled="item.disabled"
                @change="handleSelectChange(item)"
                @clear="handleClear(item)"
              >
                <el-option
                  v-for="opt in item.options"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                  :disabled="opt.disabled"
                />
              </el-select>

              <!-- 远程搜索选择器 -->
              <el-select
                v-else-if="item.type === 'remote-select'"
                v-model="searchParams[item.prop]"
                :placeholder="item.placeholder || `请输入${item.label}`"
                :filterable="true"
                :remote="true"
                :remote-method="(query) => handleRemoteSearch(item, query)"
                :loading="item.loading"
                :clearable="true"
              >
                <el-option
                  v-for="opt in item.options"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>

              <!-- 日期选择器 -->
              <el-date-picker
                v-else-if="item.type === 'date'"
                v-model="searchParams[item.prop]"
                :type="item.dateType || 'date'"
                :placeholder="item.placeholder || `请选择${item.label}`"
                :value-format="item.valueFormat || 'YYYY-MM-DD'"
                :format="item.format || 'YYYY-MM-DD'"
                :disabled="item.disabled"
                :clearable="item.clearable !== false"
                @change="handleDateChange(item)"
              />

              <!-- 日期范围 -->
              <el-date-picker
                v-else-if="item.type === 'daterange'"
                v-model="searchParams[item.prop]"
                type="daterange"
                :range-separator="item.rangeSeparator || '至'"
                :start-placeholder="item.startPlaceholder || '开始日期'"
                :end-placeholder="item.endPlaceholder || '结束日期'"
                :value-format="item.valueFormat || 'YYYY-MM-DD'"
                :disabled="item.disabled"
                :clearable="item.clearable !== false"
                @change="handleDateRangeChange(item)"
              />

              <!-- 时间选择器 -->
              <el-time-picker
                v-else-if="item.type === 'time'"
                v-model="searchParams[item.prop]"
                :placeholder="item.placeholder || `请选择${item.label}`"
                :value-format="item.valueFormat || 'HH:mm:ss'"
                :disabled="item.disabled"
                :clearable="item.clearable !== false"
              />

              <!-- 时间范围 -->
              <el-time-picker
                v-else-if="item.type === 'timerange'"
                v-model="searchParams[item.prop]"
                is-range
                :range-separator="item.rangeSeparator || '至'"
                :start-placeholder="item.startPlaceholder || '开始时间'"
                :end-placeholder="item.endPlaceholder || '结束时间'"
                :value-format="item.valueFormat || 'HH:mm:ss'"
                :disabled="item.disabled"
                :clearable="item.clearable !== false"
              />

              <!-- 开关 -->
              <el-switch
                v-else-if="item.type === 'switch'"
                v-model="searchParams[item.prop]"
                :active-text="item.activeText"
                :inactive-text="item.inactiveText"
                :disabled="item.disabled"
                @change="handleSearch"
              />

              <!-- 单选框 -->
              <el-radio-group
                v-else-if="item.type === 'radio'"
                v-model="searchParams[item.prop]"
                @change="handleSearch"
              >
                <el-radio
                  v-for="opt in item.options"
                  :key="opt.value"
                  :label="opt.value"
                  :disabled="opt.disabled"
                >
                  {{ opt.label }}
                </el-radio>
              </el-radio-group>

              <!-- 复选框 -->
              <el-checkbox-group
                v-else-if="item.type === 'checkbox'"
                v-model="searchParams[item.prop]"
                @change="handleSearch"
              >
                <el-checkbox
                  v-for="opt in item.options"
                  :key="opt.value"
                  :label="opt.value"
                  :disabled="opt.disabled"
                >
                  {{ opt.label }}
                </el-checkbox>
              </el-checkbox-group>

              <!-- 自定义插槽 -->
              <slot
                v-else-if="item.type === 'slot'"
                :name="item.slotName"
                :params="searchParams"
                :item="item"
              />
            </el-form-item>
          </el-col>
        </template>

        <!-- 操作按钮区域 -->
        <el-col :span="6" class="search-actions" v-if="showButton">
          <el-form-item class="search-buttons" :style="searchStyle">
            <el-button
              type="primary"
              native-type="submit"
              :icon="searchIcon"
              :loading="loading"
              size="small"
            >
              {{ searchText }}
            </el-button>
            <el-button @click="handleReset" :icon="resetIcon"  size="small">
              {{ resetText }}
            </el-button>

            <!-- 展开/收起按钮 -->
            <el-button
              v-if="showExpand && hasHiddenItems"
              type="text"
              @click="expanded = !expanded"
              class="expand-btn"
              size="small"
            >
              {{ expanded ? '收起' : '展开' }}
              <el-icon class="expand-icon">
                <ArrowDown v-if="!expanded" />
                <ArrowUp v-else />
              </el-icon>
            </el-button>

            <!-- 额外操作按钮插槽 -->
            <slot name="actions" :params="searchParams" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 隐藏的搜索项（展开时显示） -->
      <el-row v-if="expanded" :gutter="20" class="hidden-items">
        <template v-for="(item, index) in hiddenItems" :key="index">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" :xl="6">
            <el-form-item
              :label="item.label"
              :prop="item.prop"
              :rules="item.rules"
              :class="['search-item', { 'full-width': item.fullWidth }]"
            >
              <!-- 复用上面的控件模板 -->
              <template v-if="item.type === 'input' || !item.type">
                <el-input
                  v-model="searchParams[item.prop]"
                  :placeholder="item.placeholder || `请输入${item.label}`"
                  :clearable="item.clearable !== false"
                />
              </template>
              <!-- 其他类型同理... -->
            </el-form-item>
          </el-col>
        </template>
      </el-row>
    </el-form>
    </div>
    <div class="function-button">
      <slot name="click"></slot>
      <slot name="change"></slot>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ArrowDown, ArrowUp, Search, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  // 搜索项配置
  items: {
    type: Array,
    default: () => []
  },
  // 默认搜索参数
  defaultParams: {
    type: Object,
    default: () => ({})
  },
  // 是否内联模式
  inline: {
    type: Boolean,
    default: true
  },
  // 标签宽度
  labelWidth: {
    type: String,
    default: 'auto'
  },
  colSpan:{
    type: String,
    default: '8'
  },
  showButton:{
    type: Boolean,
    default: true
  },
  // 标签位置
  labelPosition: {
    type: String,
    default: 'right'
  },
  // 是否显示展开/收起
  showExpand: {
    type: Boolean,
    default: true
  },
  // 初始展开状态
  initExpanded: {
    type: Boolean,
    default: false
  },
  // 搜索按钮文本
  searchText: {
    type: String,
    default: '搜索'
  },
  // 重置按钮文本
  resetText: {
    type: String,
    default: '重置'
  },
  // 搜索按钮图标
  searchIcon: {
    type: Object,
    default: Search
  },
  // 重置按钮图标
  resetIcon: {
    type: Object,
    default: Refresh
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  // 每行显示数量（响应式布局）
  cols: {
    type: Object,
    default: () => ({
      xs: 24,
      sm: 12,
      md: 8,
      lg: 6,
      xl: 6
    })
  },
  rowSpan:{
    type: Number,
    default: 6
  },
  // 是否立即搜索（输入时触发）
  immediate: {
    type: Boolean,
    default: false
  },
  searchWidth:{
    type: String,
    default: '80%'
  }
})

const emit = defineEmits(['search', 'reset', 'update:modelValue'])

const collapseStyle = computed(() => {
  if(props.items.length > 3) {
    return {
      marginTop: 5 + 'px',
    }
  }

})

const searchStyle = computed(() => {
  if(props.items.length > 3) {
    return {
      marginLeft: 30 + 'px',
    }
  }

})

const formRef = ref()
const searchParams = ref({ ...props.defaultParams })
const expanded = ref(props.initExpanded)

// 计算可见和隐藏的搜索项
const visibleItems = computed(() => {
  if (!props.showExpand || expanded.value) {
    return props.items
  }
  // 默认显示前4个搜索项（可根据需要调整）
  return props.items.slice(0, 5)
})
// 计算隐藏的搜索项
const hiddenItems = computed(() => {
  if (!props.showExpand || expanded.value) {
    return []
  }
  return props.items.slice(4)
})
// 计算是否有隐藏的搜索项
const hasHiddenItems = computed(() => {
  return props.items.length > 5
})

const selectChange = () =>{
  emit('select',)

}

// 处理搜索
const handleSearch = () => {
  const params = { ...searchParams.value }

  // 处理特殊类型的参数
  props.items.forEach(item => {
    // 处理日期范围参数
    if (item.type === 'daterange' && params[item.prop]) {
      const [start, end] = params[item.prop]



      params[`${item.prop}Start`] = start
      params[`${item.prop}End`] = end
      delete params[item.prop]
    }

    // 处理时间范围参数
    if (item.type === 'timerange' && params[item.prop]) {
      const [start, end] = params[item.prop]
      params[`${item.prop}Start`] = start
      params[`${item.prop}End`] = end
      delete params[item.prop]
    }

    // 处理复选框组（数组转字符串）
    if (item.type === 'checkbox' && Array.isArray(params[item.prop])) {
      params[item.prop] = params[item.prop].join(',')
    }
  })
  emit('search', params)
  emit('update:modelValue', params)
}

// 处理重置
const handleReset = () => {
  formRef.value?.resetFields()
  searchParams.value = { ...props.defaultParams }
  emit('reset')
  handleSearch() // 重置后立即搜索
}

// 处理清除
const handleClear = (item) => {
  if (props.immediate) {
    handleSearch()
  }
}

// 处理下拉选择变化
const handleSelectChange = (item) => {
  selectChange()
  if (props.immediate) {
    handleSearch()
  }
}

// 处理日期变化
const handleDateChange = (item) => {
  if (props.immediate) {
    handleSearch()
  }
}

// 处理日期范围变化
const handleDateRangeChange = (item) => {
  if (props.immediate) {
    handleSearch()
  }
}

// 处理远程搜索
const handleRemoteSearch = (item, query) => {
  if (item.remoteMethod) {
    item.loading = true
    item.remoteMethod(query).finally(() => {
      item.loading = false
    })
  }
}

// 监听默认参数变化
watch(() => props.defaultParams, (newVal) => {
  searchParams.value = { ...newVal }
  if (props.immediate) {
    handleSearch()
  }
}, { deep: true })

// 暴露方法
defineExpose({
  search: handleSearch,
  reset: handleReset,
  getParams: () => ({ ...searchParams.value }),
  setParams: (params) => {
    searchParams.value = { ...params }
  },
  select:selectChange

})
</script>

<style lang="less" scoped>
.advanced-search-container {
  background-color: #fff;
  border-radius: 4px;
  // box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-around;
  padding: 5px;
  .contaniner-layou{
    width: 80%;
  display: flex;

  }
  .search-actions {
      display: flex;
    }
  &.is-expanded {
    .hidden-items {
      display: flex;
    }
  }
  .el-form-item{
    margin: 0;
  }
  :deep(.el-form) {
    .el-form-item {
      // margin-bottom: 18px;
      margin-right: 0;
      display: flex;
      align-items: center;

      .el-form-item__label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 12px 0 0;
      }

      .el-form-item__content {
        flex: 1;
      }

      &.full-width {
        display: block;
        .el-form-item__content {
          width: 20%;
        }
      }
    }

    .search-buttons {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 0;
      align-items: center;

      .el-button {
        margin-left: 0;
        margin-right: 10px;
      }

      .expand-btn {
        padding: 0;
        margin-left: 10px;
        color: var(--el-text-color-regular);

        &:hover {
          color: var(--el-color-primary);
        }

        .expand-icon {
          margin-left: 4px;
          transition: transform 0.3s;
        }
      }
    }
  }

  .hidden-items {
    display: none;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px dashed #eee;
  }

  @media (max-width: 768px) {
    padding: 15px;

    :deep(.el-form) {
      .el-form-item {
        display: block;
        margin-right: 0;
      }
    }

    .search-actions {
      text-align: left !important;
    }
  }
}
.function-button{
 padding-top: 5px;
}
::v-deep .el-tag {
  max-width: 230px !important;
}
</style>