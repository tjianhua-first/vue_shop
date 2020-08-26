<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="RolesDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom','vcenter',index1 === 0 ? 'bdtop': ''] "
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限和三级权限 -->
              <el-col :span="19">
                <!-- 二级 -->
                <el-row
                  :class="[index2 !== 0 ? 'bdtop':'','vcenter']"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级 -->
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-search"
              @click="showDialogRoles(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRoles(scope.row)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="RolesDialogVisible" width="50%" @close="dialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="* 角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="RolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles()">添 加</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="PutDialogVisible" width="50%" @close="putDialogClosed">
      <el-form :model="putForm" :rules="addFormRules" ref="putFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="putForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="* 角色描述" prop="roleDesc">
          <el-input v-model="putForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="PutDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="putRoles()">添 加</el-button>
      </span>
    </el-dialog>
    <!-- 权限分配对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="rightDialogVisible"
      width="50%"
      @close="rightDialogClosed"
    >
      <el-tree
        :data="rightList"
        :props="rightProps"
        show-checkbox
        node-key="id"
        default-expand-all
        ref="treeRef"
        :default-checked-keys="defkeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="postRights()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 所有角色数据
      roleList: [],
      // 添加角色数据
      addForm: {
        roleName: '',
        roleDesc: '',
      },
      RolesDialogVisible: false,
      // 添加角色验证规则
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
        ],
        roleDesc: [
          { min: 3, max: 5, message: '长度在 5 到 12 个字符', trigger: 'blur' },
        ],
      },
      PutDialogVisible: false,
      // 修改角色数据
      putForm: {},
      rightDialogVisible: false,
      // 所有权限数据
      rightList: [],
      rightProps: {
        label: 'authName',
        children: 'children',
      },
      // 默认选中的权限id值
      defkeys: [],
      //   分配权限角色的id
      roleId: '',
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    // 获取所有角色列表
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return
      this.roleList = res.data
    },
    //添加用户
    addRoles() {
      this.$refs.addFormRef.validate(async (val) => {
        if (!val) return
        // console.log(this.addForm)
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) return
        this.RolesDialogVisible = false
        this.getRoleList()
        this.$message.success('添加成功')
      })
    },
    dialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    putDialogClosed() {
      this.$refs.putFormRef.resetFields()
    },
    // 查询角色
    async showDialogRoles(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) return
      this.putForm = res.data
      // console.log(this.putForm);
      this.PutDialogVisible = true
    },
    // 修改角色
    async putRoles() {
      this.$refs.putFormRef.validate(async (val) => {
        const { data: res } = await this.$http.put(
          'roles/' + this.putForm.roleId,
          {
            roleName: this.putForm.roleName,
            roleDesc: this.putForm.roleDesc,
          }
        )
        if (res.meta.status !== 200) return
        this.PutDialogVisible = false
        this.getRoleList()
        this.$message.success('添加成功')
      })
    },
    // 删除角色
    async deleteRoles(id) {
      // 弹框提示
      this.$confirm('此操作将删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        const { data: res } = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        this.getRoleList()
        this.$message.success(res.meta.msg)
      })
    },
    // 根据id删除权限
    removeRightById(role, rightId) {
      this.$confirm('此操作将删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(async () => {
        console.log(role)
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )
        if (res.meta.status !== 200) return this.$message.error('删除失败')
        role.children = res.data
        this.$message.success(res.meta.msg)
      })
    },
    // 展示权限分配对话框
    async showRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return
      this.rightList = res.data
      //   显示默认选中
      this.getkeys(role, this.defkeys)
      //   console.log(this.defkeys)
      this.rightDialogVisible = true
    },
    // 递归获取角色三级权限的id值 保存到 defkeys数组
    getkeys(node, arr) {
      if (!node.children) return arr.push(node.id)
      node.children.forEach((item) => {
        this.getkeys(item, arr)
      })
    },
    // 对话框关闭并清空id值数组
    rightDialogClosed() {
      this.defkeys = []
      // console.log(this.defkeys);
    },
    // 提交权限分配数据
    async postRights() {
      const keys = [
        // ui组件tree的方法
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      // console.log(keys);
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) return
      this.rightDialogVisible = false
      this.getRoleList()
      this.$message.success(res.meta.msg)
    },
  },
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>