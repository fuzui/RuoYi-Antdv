<template>
  <div class="page-breadcrumb">
    <a-page-header
      :ghost="false"
    >
      <template slot="subTitle">
        <a-breadcrumb>
          <a-breadcrumb-item v-for="(item, index) in routes" :key="index" >
            <span v-if="item.redirect==='noRedirect'||index==routes.length-1">{{ item.meta.title }}</span>
            <a v-else @click.prevent="handleLink(item)"><a-icon type="home" v-if="index==0" />{{ item.meta.title }}</a>
          </a-breadcrumb-item>
        </a-breadcrumb>
      </template>
    </a-page-header>
  </div>
</template>

<script>

export default {
  name: 'PageBreadcrumb',
  props: {
  },
  components: {
  },
  data () {
    return {
      routes: []
    }
  },
  filters: {
  },
  created () {
    this.getRoutes()
  },
  computed: {
  },
  watch: {
  },
  methods: {
    getRoutes () {
      this.routes = this.$route.matched
    },
    handleLink (item) {
      const { redirect, path } = item
      if (redirect) {
        this.$router.push(redirect)
        return
      }
      this.$router.push(path)
    }
  }
}
</script>
<style lang="less" scoped>
.page-breadcrumb {
  background-color: #F5F5F5;
}
</style>
