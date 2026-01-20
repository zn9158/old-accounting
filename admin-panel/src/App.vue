<template>
  <div class="admin-container">
    <el-header class="header">
      <h2>黄金记账 - 管理后台</h2>
      <el-button type="primary" @click="fetchData">刷新数据</el-button>
    </el-header>

    <el-main>
      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="userID" label="用户ID" width="180" show-overflow-tooltip />
        <el-table-column prop="nickname" label="昵称" width="150" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column label="注册时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        
        <el-table-column label="持仓黄金 (g)" align="right">
          <template #default="scope">
            <span style="font-weight: bold; color: #E6A23C">{{ scope.row.totalWeight }} g</span>
          </template>
        </el-table-column>
        
        <el-table-column label="总投入 (元)" align="right">
          <template #default="scope">
            {{ scope.row.totalCost }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="viewRecords(scope.row)">
              查看记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>

    <!-- Dialog for Records -->
    <el-dialog v-model="dialogVisible" :title="currentUserName + ' 的交易记录'" width="800px">
      <el-table :data="recordList" border stripe height="400">
        <el-table-column prop="tradeType" label="类型" width="80">
           <template #default="scope">
             <el-tag :type="scope.row.tradeType === 'buy' || scope.row.tradeType === '买入' ? 'danger' : 'success'">
               {{ scope.row.tradeType === 'buy' || scope.row.tradeType === '买入' ? '买入' : '卖出' }}
             </el-tag>
           </template>
        </el-table-column>
        <el-table-column prop="category" label="品类" width="100" />
        <el-table-column prop="weight" label="克重(g)" width="100" />
        <el-table-column prop="unitPrice" label="单价" width="100" />
        <el-table-column prop="totalPrice" label="总价" width="120" />
        <el-table-column prop="channel" label="渠道" width="120" />
        <el-table-column label="时间" width="180">
          <template #default="scope">
             {{ formatDate(scope.row.tradeTime, true) }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const recordList = ref([])
const currentUserName = ref('')

// Configure axios base
const request = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'x-admin-key': 'gold-admin-2026'
  }
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/users')
    if (res.data.code === 200) {
      tableData.value = res.data.data
    }
  } catch (err) {
    ElMessage.error('获取数据失败')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const viewRecords = async (row) => {
  currentUserName.value = row.nickname
  dialogVisible.value = true
  recordList.value = []
  
  try {
    const res = await request.get(`/admin/users/${row.userID}/records`)
    if (res.data.code === 200) {
      recordList.value = res.data.data
    }
  } catch (err) {
    ElMessage.error('获取记录失败')
  }
}

const formatDate = (str, time = false) => {
  if (!str) return ''
  const date = new Date(str)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  if (time) {
     const hh = date.getHours().toString().padStart(2, '0')
     const mm = date.getMinutes().toString().padStart(2, '0')
     return `${y}-${m}-${d} ${hh}:${mm}`
  }
  return `${y}-${m}-${d}`
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.admin-container {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}
</style>
