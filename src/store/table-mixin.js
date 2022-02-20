import { mapState } from 'vuex'

const tableMixin = {
  computed: {
    ...mapState({
      tableSize: state => state.app.tableSize,
      tableBordered: state => state.app.tableBordered
    })
  }
}

export {
  tableMixin
}
