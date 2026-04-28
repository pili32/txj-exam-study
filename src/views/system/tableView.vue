<template>
    <base-table
      :columns="columns"
      :data="tableData"
      :pagination="true"
      :total="total"
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      show-operation
      @current-change="fetchData"
      @size-change="fetchData"
    >
      <!-- 自定义状态列 -->
      <template #status="scope">
        <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
          {{ scope.row.status === '1' ? '启用' : '禁用' }}
        </el-tag>
      </template>

      <!-- 操作列按钮 -->
      <template #operation="scope">
        <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </base-table>
  </template>

  <script>
  import { ref } from 'vue'
  import BaseTable from '@/components/BaseTable.vue'

  export default {
    components: { BaseTable },
    setup() {
      const columns = ref([
        { prop: 'date', label: '日期', width: 180, sortable: true },
        { prop: 'name', label: '姓名', width: 180 },
        { prop: 'status', label: '状态', slot: 'status' },
        { prop: 'address', label: '地址', minWidth: 200 }
      ])

      const tableData = ref([])
      const total = ref(0)
      const currentPage = ref(1)
      const pageSize = ref(10)
      const loading = ref(false)

      // 模拟获取数据
      const fetchData = async () => {
        loading.value = true
        try {
          // 这里替换为实际的API调用
          const response = await mockApi(currentPage.value, pageSize.value)
          tableData.value = response.data.list
          total.value = response.data.total
        } finally {
          loading.value = false
        }
      }

      // 初始化加载数据
      fetchData()

      const handleEdit = (row) => {
      }

      const handleDelete = (row) => {
      }

      return {
        columns,
        tableData,
        total,
        currentPage,
        pageSize,
        loading,
        fetchData,
        handleEdit,
        handleDelete
      }
    }
  }

  // 模拟API
  function mockApi(page, size) {
    return new Promise(resolve => {
      setTimeout(() => {
        const data = Array.from({ length: size }, (_, i) => ({
          date: `2023-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}`,
          name: `用户${(page - 1) * size + i + 1}`,
          status: Math.random() > 0.5 ? '1' : '0',
          address: `地址${(page - 1) * size + i + 1}`
        }))

        resolve({
          code: 200,
          data: {
            list: data,
            total: 100
          }
        })
      }, 500)
    })
  }
  </script>