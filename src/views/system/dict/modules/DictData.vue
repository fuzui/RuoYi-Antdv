<template>
  <div>
    <create-data-form
      ref="createDataForm"
      :statusOptions="statusOptions"
      :dictType="dictType"
      @ok="getList"
    />
    <a-card :bordered="false" :style="{ background: 'rgb(190, 200, 200)'}">
      <div class="table-operations">
        <a-button type="primary" size="small" @click="$refs.createDataForm.handleAdd()" v-hasPermi="['system:dict:add']" ghost>
          <a-icon type="plus" />新增
        </a-button>
        <a-button
          type="danger"
          :disabled="multiple"
          @click="handleDelete"
          size="small"
          v-hasPermi="['system:dict:remove']"
          ghost>
          <a-icon type="delete" />删除
        </a-button>
        <a-button
          type="dashed"
          shape="circle"
          :loading="loading"
          :style="{float: 'right'}"
          icon="reload"
          size="small"
          @click="getList" />
      </div>
      <a-table
        :loading="loading"
        rowKey="dictCode"
        size="small"
        :columns="columns"
        :data-source="list"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        :pagination="false">
        <span slot="status" slot-scope="text, record">
          {{ statusFormat(record) }}
        </span>
        <span slot="createTime" slot-scope="text, record">
          {{ parseTime(record.createTime) }}
        </span>
        <span slot="operation" slot-scope="text, record">
          <a @click="$refs.createDataForm.handleUpdate(record)" v-hasPermi="['system:dict:edit']">
            <a-icon type="edit" />修改
          </a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)" v-hasPermi="['system:dict:remove']">
            <a-icon type="delete" />删除
          </a>
        </span>
      </a-table>
    </a-card>
  </div>
</template>

<script>

import { listData, delData, exportData } from '@/api/system/dict/data'
import CreateDataForm from './CreateDataForm'

export default {
  name: 'DictData',
  props: {
    dictType: {
      type: String,
      required: true
    },
    dictId: {
      type: Number,
      required: true
    }
  },
  components: {
    CreateDataForm
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
      queryParam: {
        pageNum: 1,
        pageSize: 10,
        dictName: undefined,
        dictType: undefined,
        status: undefined
      },
      columns: [
        {
          title: '字典编码',
          dataIndex: 'dictCode',
          align: 'center'
        },
        {
          title: '字典标签',
          dataIndex: 'dictLabel',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '字典键值',
          dataIndex: 'dictValue',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '字典排序',
          dataIndex: 'dictSort',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'status' },
          align: 'center'
        },
        {
          title: '备注',
          dataIndex: 'remark',
          ellipsis: true,
          align: 'center'
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          ellipsis: true,
          scopedSlots: { customRender: 'createTime' },
          align: 'center'
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: '15%',
          scopedSlots: { customRender: 'operation' },
          align: 'center'
        }
      ]
    }
  },
  filters: {
  },
  created () {
    this.queryParam.dictType = this.dictType
    this.getList()
    this.getDicts('sys_normal_disable').then(response => {
      this.statusOptions = response.data
    })
  },
  computed: {
  },
  watch: {
  },
  methods: {
    getList () {
      this.loading = true
      listData(this.queryParam).then(response => {
          this.list = response.rows
          this.total = response.total
          this.loading = false
        }
      )
    },
    // 状态字典翻译
    statusFormat (row) {
      return this.selectDictLabel(this.statusOptions, row.status)
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
        dictName: undefined,
        dictType: undefined,
        status: undefined
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
      this.ids = this.selectedRows.map(item => item.dictCode)
      this.single = selectedRowKeys.length !== 1
      this.multiple = !selectedRowKeys.length
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      var that = this
      const dictCodes = row.dictCode || this.ids
      this.$confirm({
        title: '确认删除所选中数据?',
        content: '当前选中字典编码为' + dictCodes + '的数据',
        onOk () {
          return delData(dictCodes)
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
          return exportData(that.queryParam)
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
