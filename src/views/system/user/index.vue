<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <a-row :gutter="24">
        <a-col :span="4">
          <!-- 部门树 -->
          <dept-tree
            ref="deptTree"
            :deptOptions="deptOptions"
            @select="clickDeptNode"
          />
        </a-col>
        <a-col :span="20">
          <!-- 条件搜索 -->
          <div class="table-page-search-wrapper">
            <a-form layout="inline">
              <a-row :gutter="48">
                <a-col :md="8" :sm="24">
                  <a-form-item label="用户名称">
                    <a-input v-model="queryParam.userName" placeholder="请输入" allow-clear />
                  </a-form-item>
                </a-col>
                <a-col :md="8" :sm="24">
                  <a-form-item label="手机号" >
                    <a-input v-model="queryParam.phonenumber" placeholder="请输入" allow-clear />
                  </a-form-item>
                </a-col>
                <template v-if="advanced">
                  <a-col :md="8" :sm="24">
                    <a-form-item label="状态" prop="status">
                      <a-select placeholder="请选择状态" style="width: 100%" allow-clear>
                        <a-select-option v-for="(d, index) in statusOptions" :key="index" :value="d.dictValue">{{ d.dictLabel }}</a-select-option>
                      </a-select>
                    </a-form-item>
                  </a-col>
                  <a-col :md="8" :sm="24">
                    <a-form-item label="创建时间">
                      <a-range-picker style="width: 100%" v-model="dateRange" valueFormat="YYYY-MM-DD" format="YYYY-MM-DD" allow-clear />
                    </a-form-item>
                  </a-col>
                </template>
                <a-col :md="!advanced && 8 || 24" :sm="24">
                  <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                    <a-button type="primary" @click="handleQuery"><a-icon type="search" />查询</a-button>
                    <a-button style="margin-left: 8px" @click="resetQuery"><a-icon type="redo" />重置</a-button>
                    <a @click="toggleAdvanced" style="margin-left: 8px">
                      {{ advanced ? '收起' : '展开' }}
                      <a-icon :type="advanced ? 'up' : 'down'"/>
                    </a>
                  </span>
                </a-col>
              </a-row>
            </a-form>
          </div>
          <!-- 操作 -->
          <div class="table-operations">
            <a-button type="primary" @click="$refs.createForm.handleAdd()" v-hasPermi="['system:user:add']">
              <a-icon type="plus" />新增
            </a-button>
            <a-button type="primary" :disabled="single" @click="$refs.createForm.handleUpdate(undefined,ids)" v-hasPermi="['system:user:edit']">
              <a-icon type="edit" />修改
            </a-button>
            <a-button type="danger" :disabled="multiple" @click="handleDelete" v-hasPermi="['system:user:remove']">
              <a-icon type="delete" />删除
            </a-button>
            <a-button type="dashed" @click="$refs.importExcel.importExcelHandleOpen()" v-hasPermi="['system:user:import']">
              <a-icon type="import" />导入
            </a-button>
            <a-button type="primary" @click="handleExport" v-hasPermi="['system:user:export']">
              <a-icon type="download" />导出
            </a-button>
            <a-button
              type="dashed"
              shape="circle"
              :loading="loading"
              :style="{float: 'right'}"
              icon="reload"
              @click="getList" />
          </div>
          <!-- 增加修改 -->
          <!-- 创建/编辑用户,单独封装了组件 -->
          <create-form
            ref="createForm"
            :deptOptions="deptOptions"
            :statusOptions="statusOptions"
            :sexOptions="sexOptions"
            @ok="getList"
            @select-tree="getTreeselect"
          />
          <!-- 修改密码抽屉 -->
          <reset-password
            ref="resetPassword"
          />
          <!-- 上传文件 -->
          <import-excel
            ref="importExcel"
            @ok="getList"
          />
          <!-- 数据展示 -->
          <a-table
            :loading="loading"
            :size="tableSize"
            rowKey="userId"
            :columns="columns"
            :data-source="list"
            :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
            :pagination="false">
            <span slot="status" slot-scope="text, record">
              <a-popconfirm
                ok-text="是"
                cancel-text="否"
                @confirm="confirmHandleStatus(record)"
                @cancel="cancelHandleStatus(record)"
              >
                <span slot="title">确认<b>{{ record.status === '1' ? '启用' : '停用' }}</b>{{ record.nickName }}的用户吗?</span>
                <a-switch checked-children="开" un-checked-children="关" :checked="record.status == 0" />
              </a-popconfirm>
            </span>
            <span slot="createTime" slot-scope="text, record">
              {{ parseTime(record.createTime) }}
            </span>
            <span slot="operation" slot-scope="text, record">
              <a @click="$refs.createForm.handleUpdate(record,undefined)" v-hasPermi="['system:user:edit']">
                <a-icon type="edit" />
                修改
              </a>
              <a-divider type="vertical" v-if="record.userId !== 1" v-hasPermi="['system:user:remove']" />
              <a @click="handleDelete(record)" v-if="record.userId !== 1" v-hasPermi="['system:user:remove']">
                <a-icon type="delete" />
                删除
              </a>
              <a-divider type="vertical" v-hasPermi="['system:user:resetPwd']" />
              <a @click="$refs.resetPassword.handleResetPwd(record)" v-hasPermi="['system:user:resetPwd']">
                <a-icon type="key" />
                重置
              </a>
            </span>
          </a-table>
          <!-- 分页 -->
          <a-pagination
            class="ant-table-pagination"
            show-size-changer
            show-quick-jumper
            :current="queryParam.pageNum"
            :total="total"
            :page-size="queryParam.pageSize"
            :showTotal="total => `共 ${total} 条`"
            @showSizeChange="onShowSizeChange"
            @change="changeSize"
          />
        </a-col>
      </a-row>
    </a-card>
  </page-header-wrapper>
</template>

<script>

import { listUser, delUser, exportUser, changeUserStatus } from '@/api/system/user'
import { treeselect } from '@/api/system/dept'
import ResetPassword from './modules/ResetPassword'
import CreateForm from './modules/CreateForm'
import ImportExcel from './modules/ImportExcel'
import DeptTree from './modules/DeptTree'

export default {
  name: 'User',
  components: {
    ResetPassword,
    CreateForm,
    ImportExcel,
    DeptTree
  },
  data () {
    return {
      list: [],
      selectedRowKeys: [],
      selectedRows: [],
      // 高级搜索 展开/关闭
      advanced: false,
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      ids: [],
      loading: false,
      total: 0,
      // 状态数据字典
      statusOptions: [],
      sexOptions: [],
      // 部门树选项
      deptOptions: [{
        id: 0,
        label: '',
        children: []
      }],
      // 日期范围
      dateRange: [],
      queryParam: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: undefined
      },
      columns: [
        {
          title: '用户编号',
          dataIndex: 'userId',
          align: 'center'
        },
        {
          title: '用户名',
          dataIndex: 'userName',
          align: 'center'
        },
        {
          title: '用户昵称',
          dataIndex: 'nickName',
          align: 'center'
        },
        {
          title: '部门',
          dataIndex: 'dept.deptName',
          scopedSlots: { customRender: 'dept.deptName' },
          align: 'center'
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
          align: 'center'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          align: 'center'
        },
        {
          title: '操作',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
          align: 'center'
        }
      ]
    }
  },
  filters: {
  },
  created () {
    this.getList()
    this.getTreeselect()
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data
    })
    this.getDicts('sys_user_sex').then(response => {
      this.sexOptions = response.data
    })
  },
  computed: {
  },
  watch: {
  },
  methods: {
    /** 查询用户列表 */
    getList () {
      this.loading = true
      listUser(this.addDateRange(this.queryParam, this.dateRange)).then(response => {
          this.list = response.rows
          this.total = response.total
          this.loading = false
        }
      )
    },
    /** 查询部门下拉树结构 */
    getTreeselect () {
      treeselect().then(response => {
        this.deptOptions = response.data
      })
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParam.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.dateRange = []
      this.queryParam = {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phonenumber: undefined,
        status: undefined,
        deptId: undefined
      }
      this.handleQuery()
    },
    onShowSizeChange (current, pageSize) {
      this.queryParam.pageSize = pageSize
      this.getList()
    },
    changeSize (current, pageSize) {
      this.queryParam.pageNum = current
      this.queryParam.pageSize = pageSize
      this.getList()
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
      this.ids = this.selectedRows.map(item => item.userId)
      this.single = selectedRowKeys.length !== 1
      this.multiple = !selectedRowKeys.length
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    clickDeptNode (deptId) {
      this.queryParam.deptId = deptId
      this.getList()
    },
    /* 用户状态修改 */
    confirmHandleStatus (row) {
      const text = row.status === '1' ? '启用' : '关闭'
      row.status = row.status === '0' ? '1' : '0'
      changeUserStatus(row.userId, row.status)
      .then(() => {
        this.$message.success(
          text + '成功',
          3
        )
      }).catch(function () {
        this.$message.error(
          text + '异常',
          3
        )
      })
    },
    cancelHandleStatus (row) {
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      var that = this
      const userIds = row.userId || this.ids
      this.$confirm({
        title: '确认删除所选中数据?',
        content: '当前选中编号为' + userIds + '的数据',
        onOk () {
          return delUser(userIds)
            .then(() => {
              that.onSelectChange([], [])
              that.getList()
              that.$message.success(
                '删除成功',
                3
              )
          })
        },
        onCancel () {}
      })
    },
    /** 导出按钮操作 */
    handleExport () {
      var that = this
      this.$confirm({
        title: '是否确认导出?',
        content: '此操作将导出当前条件下所有数据而非选中数据',
        onOk () {
          return exportUser(that.queryParam)
            .then(response => {
              that.download(response.msg)
              that.$message.success(
                '导出成功',
                3
              )
          })
        },
        onCancel () {}
      })
    }
  }
}
</script>
