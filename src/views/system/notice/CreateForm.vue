<template>
  <page-header-wrapper @back="back">
    <template v-slot:breadcrumb>
      {{ formTitle }}
    </template>
    <template v-slot:title>
      {{ formTitle }}
    </template>
    <template v-slot:content>
    </template>
    <template v-slot:extraContent>
    </template>
    <a-card :bordered="false">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-model-item label="公告标题" prop="noticeTitle">
          <a-input v-model="form.noticeTitle" placeholder="请输入" />
        </a-form-model-item>
        <a-form-model-item label="公告类型" prop="noticeType">
          <a-select placeholder="请选择" v-model="form.noticeType">
            <a-select-option v-for="(d, index) in typeOptions" :key="index" :value="d.dictValue" >{{ d.dictLabel }}</a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="状态" prop="status">
          <a-radio-group v-model="form.status" button-style="solid">
            <a-radio-button v-for="(d, index) in statusOptions" :key="index" :value="d.dictValue" >{{ d.dictLabel }}</a-radio-button>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item label="内容" prop="noticeContent">
        </a-form-model-item>
        <div id="vditor" name="description" ></div>
        <footer-tool-bar>
          <a-space>
            <a-button type="primary" @click="submitForm">
              发布
            </a-button>
            <a-button type="dashed" @click="back">
              取消
            </a-button>
          </a-space>
        </footer-tool-bar>
      </a-form-model>
    </a-card>
  </page-header-wrapper>
</template>

<script>

import { getNotice, addNotice, updateNotice } from '@/api/system/notice'
import Vditor from 'vditor'
import 'vditor/dist/index.css'

export default {
  name: 'CreateForm',
  components: {
  },
  data () {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      loading: false,
      total: 0,
      id: undefined,
      formTitle: '',
      contentEditor: '',
      // 状态数据字典
      statusOptions: [],
      typeOptions: [],
      // 表单参数
      form: {
        noticeId: undefined,
        noticeTitle: undefined,
        noticeType: undefined,
        noticeContent: '',
        status: '0'
      },
      rules: {
        noticeTitle: [{ required: true, message: '公告标题不能为空', trigger: 'blur' }],
        noticeType: [{ required: true, message: '公告类型不能为空', trigger: 'change' }]
      }
    }
  },
  filters: {
  },
  created () {
    this.getDicts('sys_notice_status').then(response => {
      this.statusOptions = response.data
    })
    this.getDicts('sys_notice_type').then(response => {
      this.typeOptions = response.data
    })
  },
  computed: {
  },
  watch: {
  },
  mounted () {
    this.id = this.$route.params.id
    this.formTitle = this.$route.params.formTitle
    this.contentEditor = new Vditor('vditor', {
      height: 360,
      toolbarConfig: {
        pin: true
      },
      cache: {
        enable: false
      },
      after: () => {
        this.contentEditor.setValue(this.form.noticeContent)
      }
    })
    if (this.id) {
      this.handleUpdate(this.id)
    } else {
      this.handleAdd()
    }
  },
  methods: {
    // 表单重置
    reset () {
      this.form = {
        noticeId: undefined,
        noticeTitle: undefined,
        noticeType: undefined,
        noticeContent: '',
        status: '0'
      }
    },
     /** 新增按钮操作 */
    handleAdd () {
      this.reset()
      this.formTitle = '添加公告'
    },
    /** 修改按钮操作 */
    handleUpdate (id) {
      this.reset()
      const noticeId = id
      getNotice(noticeId).then(response => {
        this.form = response.data
        this.formTitle = '修改公告'
        this.contentEditor.setValue(response.data.noticeContent)
      })
    },
    /** 提交按钮 */
    submitForm: function () {
      this.form.noticeContent = this.contentEditor.getValue()
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.form.noticeId !== undefined) {
            updateNotice(this.form).then(response => {
              this.$message.success(
                '修改成功',
                3
              )
              this.back()
            })
          } else {
            addNotice(this.form).then(response => {
              this.$message.success(
                '新增成功',
                3
              )
              this.back()
            })
          }
        } else {
          return false
        }
      })
    },
    back () {
      this.$router.push('/system/notice')
    }
  }
}
</script>
<style lang="less" scoped>
#vditor {
  margin: 0 5% 5% 5%;
}
</style>
