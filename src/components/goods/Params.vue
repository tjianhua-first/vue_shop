<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 警告 -->
      <el-alert title="注意：只允许设置第三级分类相关参数" show-icon type="warning" :closable="false"></el-alert>
      <!-- 选择商品分类 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="{ expandTrigger: 'hover',value:'cat_id',label:'cat_name',children:'children' }"
            @change="cateChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <el-tab-pane label="动态管理" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnCascader"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- tag -->
                <el-tag closable v-for="(item,i) in scope.row.attr_vals" :key="i" @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <!-- 按钮与文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index">#</el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-setting"
                  @click="showPutDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnCascader"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- tag -->
                <el-tag closable v-for="(item,i) in scope.row.attr_vals" :key="i" @close="handleClose(i,scope.row)">{{item}}</el-tag>
                <!-- 按钮与文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index">#</el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-setting"
                  @click="showPutDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="deleteParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <el-form
        :model="addForm"
        :rules="addRules"
        ref="addFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="putDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <el-form
        :model="putForm"
        :rules="addRules"
        ref="putFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="putForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="putDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="putParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品分类数据
      cateList: [],
      //   级联选择器双向绑定数据
      selectedKeys: [],
      //   激活的页签
      activeName: 'many',
      //   参数数据
      manyTableData: [],
      onlyTableData: [],
      //   添加参数对话框
      addDialogVisible: false,
      //   添加参数的表单数据
      addForm: {
        attr_name: '',
      },
      addRules: {
        attr_name: [{ required: true, message: '请输入内容', trigger: 'blur' }],
      },
      //   修改参数对话框
      putDialogVisible: false,
      //   修改表单数据
      putForm: {},
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //   获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return
      this.cateList = res.data
    },
    // 监听级联选择器
    async cateChange() {
      //   console.log(this.selectedKeys)
      // 根据所选的分类和对应的面板获取对应的参数
      this.getParamsData()
    },
    // 获取参数列表
    async getParamsData() {
      if(this.selectedKeys.length === 0) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
      }
      const { data: res } = await this.$http.get(
        'categories/' + this.cateId + '/attributes',
        { params: { sel: this.activeName } }
      )
      if (res.meta.status !== 200)
        return 
    console.log(res.data)
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals.trim()
        item.attr_vals.substr(0, 1) === ',' ? item.attr_vals = item.attr_vals.slice(1) : ''
        item.attr_vals !== '' ? item.attr_vals =  item.attr_vals.split(','):[]
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框里输入的值
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // tab页签点击事件
    handleTabClick() {
      //   console.log(this.activeName)
      //   console.log(this.selectedKeys);
      if (this.selectedKeys.length === 0) return
      this.getParamsData()
    },
    // 监听对话框关闭事件
    addDialogClose() {
      this.$refs.addFormRef.resetFields()
      this.$refs.putFormRef.resetFields()
    },
    // 添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 201) return this.$message.error('添加失败')
        this.$message.success('添加成功')
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    // 修改对话框显示
    async showPutDialog(id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: { attr_sel: this.activeName },
        }
      )
      if (res.meta.status !== 200) return this.$message.error('查询失败')
      this.putForm = res.data
      this.putDialogVisible = true
    },
    // 修改参数
    putParams() {
      this.$refs.putFormRef.validate(async (valid) => {
        if (!valid) return
        const {
          data: res,
        } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.putForm.attr_id}`,
          { attr_name: this.putForm.attr_name, attr_sel: this.activeName }
        )
        if (res.meta.status !== 200) return this.$message.error('修改参数失败')
        this.$message.success('修改参数成功')
        this.getParamsData()
        this.putDialogVisible = false
      })
    },
    // 删除参数
    deleteParams(id) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        const { data: res } = await this.$http.delete(
          `categories/${this.cateId}/attributes/${id}`
        )
        if (res.meta.status !== 200) return this.$message.error('删除参数失败')
        this.getParamsData()
        this.$message({
          type: 'success',
          message: '删除成功!',
        })
      })
    },
    // 文本框失去焦点或者按下enter
   handleInputConfirm(row){
        // 文本框无内容
        if(row.inputValue.trim().length === 0){
            row.inputValue = ''
            row.inputVisible = false
            return
        }
        // 有内容 添加到标签
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        // 发起请求 提交参数
        this.putAttrVals(row)       
    },
    // 提交参数
    async putAttrVals(row){
      const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
            attr_name:row.attr_name,attr_sel:row.attr_sel,attr_vals:row.attr_vals.join(',').trim()
        })
      if (res.meta.status !== 201) return
    },
    // 点击按钮 展示文本框
    showInput(row){
        row.inputVisible = true
        // 让文本框自动获得焦点
        // $nextTick 作用：当页面上元素重新渲染之后，才会执行回调函数的代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },
    // 删除展开列标签
    handleClose(i,row){
      row.attr_vals.splice(i,1)
      this.putAttrVals(row)
    }
  },
  computed: {
    //   按钮禁用
    isBtnCascader() {
      if (this.selectedKeys.length !== 0) return false
      return true
    },
    // 当前选择的分类id
    cateId() {
      if (this.selectedKeys.length !== 0)
        return this.selectedKeys[this.selectedKeys.length - 1]
      return null
    },
    // 标题文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },
  },
}
</script>
<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
    width: 150px;
}
</style>