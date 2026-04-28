<template>
  <div class="base-table-container">
    <el-table
      v-loading="loading"
      ref="tableRef"
      :data="tableData"
      :border="border"
      :stripe="stripe"
      :size="size"
      :height="height"
      :max-height="maxHeight"
      @select="handleSelect"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      highlight-current-row
      :empty-text="emptyText"
      :row-key="rowKey"
      :row-style="setRowHeight"

    >
      <!-- 多选列 -->
      <el-table-column
        v-if="selection"
        type="selection"
        width="55"
        :reserve-selection="reserveSelection"
      />

      <!-- 索引列 -->
      <el-table-column
        v-if="index"
        type="index"
        :label="indexLabel"
        :width="indexWidth"
      />

      <!-- 动态列 -->
      <template v-for="column in columns" :key="column.prop">
        <el-table-column
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :align="column.align || 'center'"
          :header-align="column.headerAlign || 'center'"
          :sortable="column.sortable || false"
          :fixed="column.fixed"
          :resizable="column.resizable || true"
        >
          <!-- 自定义列内容 -->
          <template v-if="column.slot" #default="scope">

            <slot :name="column.slot" :row="scope.row" :$index="scope.$index" />
          </template>
        </el-table-column>
      </template>

      <!-- 操作列 -->
      <el-table-column
        v-if="showOperation"
        :label="operationLabel"
        :width="operationWidth"
        :fixed="operationFixed"
        align="center"
      >
        <template #default="scope">
          <slot name="operation" :row="scope.row" :$index="scope.$index" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div v-if="pagination" class="pagination-container">
      <div>
        总共<span style="color: #d03545">{{ total }}</span
      >条记录

      </div>


      <el-pagination
        :current-page="currentPage"
        :page-sizes="pageSizes"
        background
        :layout="paginationLayout"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="mt-4"
        size="small"
      />
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'BaseTable',
  props: {
    // 表格数据
    data: {
      type: Array,
      default: () => []
    },
    // 列配置
    columns: {
      type: Array,
      required: true,
      validator: (columns) => {
        return columns.every(column => column.prop && column.label)
      }
    },
    // 是否显示多选框
    selection: {
      type: Boolean,
      default: false
    },
    // 是否保留选中状态
    reserveSelection: {
      type: Boolean,
      default: false
    },
    // 是否显示索引列
    index: {
      type: Boolean,
      default: false
    },
    // 索引列标签
    indexLabel: {
      type: String,
      default: '序号'
    },
    // 索引列宽度
    indexWidth: {
      type: [String, Number],
      default: 60
    },
    // 是否显示操作列
    showOperation: {
      type: Boolean,
      default: false
    },
    // 操作列标签
    operationLabel: {
      type: String,
      default: '操作'
    },
    // 操作列宽度
    operationWidth: {
      type: [String, Number],
      default: 120
    },
    // 操作列是否固定
    operationFixed: {
      type: [String, Boolean],
      default: false
    },
    // 是否显示边框
    border: {
      type: Boolean,
      default: true
    },
    // 是否为斑马纹
    stripe: {
      type: Boolean,
      default: true
    },
    // 表格尺寸
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['large', 'default', 'small'].includes(value)
    },
    // 表格高度
    height: [String, Number],

    emptyText:{
      type: String,
      default: '暂无数据',
    },
    // 表格最大高度
    maxHeight: [String, Number],
    // 是否显示分页
    pagination: {
      type: Boolean,
      default: true
    },
    // 当前页码
    currentPage: {
      type: Number,
      default: 1
    },
    // 每页显示条目数
    pageSize: {
      type: Number,
      default: 10
    },
    // 每页显示条目数选择器
    pageSizes: {
      type: Array,
      default: () => [10, 20, 30, 50, 100]
    },
    // 分页组件布局
    paginationLayout: {
      type: String,
      default: ' sizes, prev, pager, next'
    },
    // 总条目数
    total: {
      type: Number,
      default: 100
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    rowKey:{
      type: String,
      default: ''
    },
  },
  emits: [
    'select',
    'selection-change',
    'sort-change',
    'size-change',
    'current-change',
    'update:currentPage',
    'update:pageSize'
  ],
  setup(props, { emit }) {
    const setRowHeight = () => {


      // const rowCount = tableData.value.length+1;
      // return { height: `${props.height / rowCount}px` };
    }
    const tableData = ref([])
    const tableRef = ref(null)
    // 监听data变化更新表格数据
    watch(() => props.data, (val) => {
      tableData.value = val
    }, { immediate: true })

    // 多选变化
    const handleSelectionChange = (selection) => {
      emit('selection-change', selection)
    }

    const handleSelect = (selection,row) =>{
      emit('select', selection,row)
    }

    // 排序变化
    const handleSortChange = ({ column, prop, order }) => {
      emit('sort-change', { column, prop, order })
    }
     // 暴露方法
     const exposeMethods = {
      clearSelection: () => tableRef.value?.clearSelection(),
      toggleRowSelection: (row, selected) => tableRef.value?.toggleRowSelection(row, selected),
      toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
      toggleRowExpansion: (row, expanded) => tableRef.value?.toggleRowExpansion(row, expanded),
      setCurrentRow: (row) => tableRef.value?.setCurrentRow(row),
      clearSort: () => tableRef.value?.clearSort(),
      clearFilter: () => tableRef.value?.clearFilter(),
      doLayout: () => tableRef.value?.doLayout(),
      sort: (prop, order) => tableRef.value?.sort(prop, order)
    }

    // 每页条数变化
    const handleSizeChange = (val) => {
      emit('update:pageSize', val)
      emit('size-change', val)
    }

    // 当前页变化
    const handleCurrentChange = (val) => {
      console.log(val)

      emit('update:currentPage', val)
      emit('current-change', val)
    }

    return {
      tableRef,
      tableData,
      handleSelectionChange,
      handleSelect,
      handleSortChange,
      handleSizeChange,
      handleCurrentChange,
      setRowHeight,
      ...exposeMethods
    }
  }
}
</script>

<style scoped lang="less">
.base-table-container {
  width: 100%;
  ::v-deep {
  .el-table__inner-wrapper{
    border-radius: 10px;
  }
}

}
.el-table--default{
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;

}

.pagination-container {
  padding: 15px 0;
  display: flex;
  justify-content: space-between;
  background: #fff;
}
</style>