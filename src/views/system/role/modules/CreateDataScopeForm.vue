<template>
  <a-drawer
    width="35%"
    :label-col="4"
    :wrapper-col="14"
    :visible="openDataScope"
    @close="onClose">
    <a-divider orientation="left">
      <b>{{ formTitle }}</b>
    </a-divider>
    <a-form-model ref="form" :model="form">
      <a-form-model-item label="角色名称" prop="roleName">
        <a-input v-model="form.roleName" :disabled="true" />
      </a-form-model-item>
      <a-form-model-item label="角色标识" prop="roleKey">
        <a-input v-model="form.roleKey" :disabled="true" />
      </a-form-model-item>
      <a-form-model-item label="权限范围" prop="dataScope">
        <a-select placeholder="请选择" v-model="form.dataScope" style="width: 100%">
          <a-select-option v-for="(d, index) in dataScopeOptions" :key="index" :value="d.value">{{ d.label }}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="数据权限" v-show="form.dataScope == 2">
        <a-checkbox @change="handleCheckedTreeExpand($event)">
          展开/折叠
        </a-checkbox>
        <a-checkbox @change="handleCheckedTreeNodeAll($event)">
          全选/全不选
        </a-checkbox>
        <a-checkbox @change="handleCheckedTreeConnect($event)" :checked="form.deptCheckStrictly">
          父子联动
        </a-checkbox>
        <a-tree
          v-model="deptCheckedKeys"
          checkable
          :checkStrictly="!form.deptCheckStrictly"
          :expanded-keys="deptExpandedKeys"
          :auto-expand-parent="autoExpandParent"
          :tree-data="deptOptions"
          @expand="onExpandDept"
          :replaceFields="defaultProps"
        />
      </a-form-model-item>
      <div class="bottom-control">
        <a-space>
          <a-button type="primary" @click="submitDataScope">
            保存
          </a-button>
          <a-button type="dashed" @click="cancel">
            取消
          </a-button>
        </a-space>
      </div>
    </a-form-model>
  </a-drawer>
</template>

<script>

import { getRole, dataScope } from '@/api/system/role'
import { treeselect as deptTreeselect, roleDeptTreeselect } from '@/api/system/dept'

export default {
  name: 'CreateDataScopeForm',
  components: {
  },
  data () {
    return {
      loading: false,
      // 数据范围选项
      dataScopeOptions: [
        {
          value: '1',
          label: '全部数据权限'
        },
        {
          value: '2',
          label: '自定义数据权限'
        },
        {
          value: '3',
          label: '本部门数据权限'
        },
        {
          value: '4',
          label: '本部门及以下数据权限'
        },
        {
          value: '5',
          label: '仅本人数据权限'
        }
      ],
      deptExpandedKeys: [],
      autoExpandParent: false,
      deptCheckedKeys: [],
      halfCheckedKeys: [],
      // 部门列表
      deptOptions: [],
      formTitle: '',
      // 表单参数
      form: {
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        status: '0',
        deptIds: [],
        deptCheckStrictly: true,
        remark: undefined
      },
      // 是否显示弹出层（数据权限）
      openDataScope: false,
      deptExpand: true,
      deptNodeAll: false,
      defaultProps: {
        children: 'children',
        title: 'label',
        key: 'id'
      }
    }
  },
  filters: {
  },
  created () {
  },
  computed: {
  },
  watch: {
  },
  methods: {
    onExpandDept (expandedKeys) {
      this.deptExpandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    /** 查询部门树结构 */
    getDeptTreeselect () {
      deptTreeselect().then(response => {
        this.deptOptions = response.data
      })
    },
    // 所有部门节点数据
    getDeptAllCheckedKeys () {
      // 全选与半选
      return this.deptCheckedKeys.concat(this.halfCheckedKeys)
    },
    getAllDeptNode (nodes) {
      if (!nodes || nodes.length === 0) {
        return []
      }
      nodes.forEach(node => {
        this.deptCheckedKeys.push(node.id)
        return this.getAllDeptNode(node.children)
      })
    },
    // 回显过滤
    selectNodefilter (nodes, parentIds) {
      if (!nodes || nodes.length === 0) {
        return []
      }
      nodes.forEach(node => {
        // 父子关联模式且当前元素有父级
        const currentIndex = this.deptCheckedKeys.indexOf(node.id)
        // 当前节点存在,且父节点不存在，则说明父节点应是半选中状态
        if (currentIndex !== -1) {
          parentIds.forEach(parentId => {
            if (this.halfCheckedKeys.indexOf(parentId) === -1) {
              this.halfCheckedKeys.push(parentId)
            }
          })
          parentIds = []
        }
        // 防重
        const isExist = this.halfCheckedKeys.indexOf(node.id)
        const isExistParentIds = parentIds.indexOf(node.id)
        if (isExist === -1 && isExistParentIds === -1 && currentIndex === -1) {
          parentIds.push(node.id)
        }
        return this.selectNodefilter(node.children, parentIds)
      })
    },
    handleCheckedTreeNodeAll (value) {
      if (value.target.checked) {
        this.getAllDeptNode(this.deptOptions)
      } else {
        this.deptCheckedKeys = []
        this.halfCheckedKeys = []
      }
    },
    handleCheckedTreeExpand (value) {
      if (value.target.checked) {
        const treeList = this.deptOptions
        for (let i = 0; i < treeList.length; i++) {
          this.deptExpandedKeys.push(treeList[i].id)
        }
      } else {
        this.deptExpandedKeys = []
      }
    },
    // 树权限（父子联动）
    handleCheckedTreeConnect (value) {
      this.form.deptCheckStrictly = !this.form.deptCheckStrictly
    },
    /** 根据角色ID查询部门树结构 */
    getRoleDeptTreeselect (roleId) {
      return roleDeptTreeselect(roleId).then(response => {
        this.deptOptions = response.depts
        return response
      })
    },
    onCheck (checkedKeys, info) {
      if (!this.form.deptCheckStrictly) {
        let currentCheckedKeys = []
        if (this.deptCheckedKeys.checked) {
          currentCheckedKeys = currentCheckedKeys.concat(this.deptCheckedKeys.checked)
        }
        if (this.deptCheckedKeys.halfChecked) {
          currentCheckedKeys = currentCheckedKeys.concat(this.deptCheckedKeys.halfChecked)
        }
        this.deptCheckedKeys = currentCheckedKeys
      } else {
        // 半选节点
        this.halfCheckedKeys = info.halfCheckedKeys
        this.deptCheckedKeys = checkedKeys
      }
    },
    onClose () {
      this.openDataScope = false
    },
    // 取消按钮
    cancel () {
      this.openDataScope = false
      this.reset()
    },
    // 表单重置
    reset () {
      this.deptExpand = true
      this.deptNodeAll = false
      this.deptExpandedKeys = []
      this.autoExpandParent = false
      this.deptCheckedKeys = []
      this.halfCheckedKeys = []
      this.form = {
        roleId: undefined,
        roleName: undefined,
        roleKey: undefined,
        roleSort: 0,
        status: '0',
        deptIds: [],
        deptCheckStrictly: true,
        remark: undefined
      }
    },
    /** 分配数据权限操作 */
    handleDataScope (row) {
      this.reset()
      const roleDeptTreeselect = this.getRoleDeptTreeselect(row.roleId)
      getRole(row.roleId).then(response => {
        this.form = response.data
        this.openDataScope = true
        this.$nextTick(() => {
          roleDeptTreeselect.then(res => {
            this.deptCheckedKeys = res.checkedKeys
            // 过滤回显时的半选中node(父)
            if (this.form.deptCheckStrictly) {
              this.selectNodefilter(this.deptOptions, [])
            }
          })
        })
        this.formTitle = '分配数据权限'
      })
    },
    /** 提交按钮（数据权限） */
    submitDataScope: function () {
      if (this.form.roleId !== undefined) {
        this.form.deptIds = this.getDeptAllCheckedKeys()
        dataScope(this.form).then(response => {
          this.$message.success(
            '修改成功',
            3
          )
          this.openDataScope = false
          this.$emit('ok')
        })
      }
    }
  }
}
</script>
