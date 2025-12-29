<template>
  <div class="app-container">

    <!-- 搜索表单 -->
    <el-form ref="queryRef" :inline="true" label-width="68px">
      <el-form-item label="柜机编号" prop="cabinetNo">
        <el-input
            v-model="queryParams.cabinetNo"
            placeholder="请输入柜机编号"
            clearable
        />
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入名称"
            clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 功能按钮栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['device:cabinet:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            @click="handleDelete"
            :disabled="multiple"
        >删除</el-button>
      </el-col>
    </el-row>

    <!-- 数据展示表格 -->
    <el-table v-loading="loading" :data="cabinetList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="柜机编号" prop="cabinetNo" width="120"/>
      <el-table-column label="名称" prop="name" width="150"/>
      <el-table-column label="类型" prop="cabinetTypeName" width="120"/>
      <el-table-column label="总插槽" prop="totalSlots" width="80"/>
      <el-table-column label="空闲插槽" prop="freeSlots" width="80"/>
      <el-table-column label="已用插槽" prop="usedSlots" width="80"/>
      <el-table-column label="可用充电宝" prop="availableNum" width="100"/>
      <el-table-column label="描述" prop="description" />
      <el-table-column label="状态" prop="status" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status == '1' ? 'success' : scope.row.status == '0' ? 'info' : 'danger'">
            {{ scope.row.status == '1' ? '使用中' : scope.row.status == '0' ? '未投入' : '故障' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160"/>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页条组件 -->
    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="cabinetRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="柜机编号" prop="cabinetNo">
          <el-input v-model="form.cabinetNo" placeholder="请输入柜机编号" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="柜机类型" prop="cabinetTypeId">
          <el-select v-model="form.cabinetTypeId" placeholder="请选择柜机类型" style="width: 100%">
            <el-option
                v-for="item in cabinetTypeList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="总插槽数量" prop="totalSlots">
          <el-input-number v-model="form.totalSlots" :min="1" :max="50" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="0">未投入</el-radio>
            <el-radio label="1">使用中</el-radio>
            <el-radio label="-1">故障</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup name="Cabinet">
import { listCabinet, addCabinet, getCabinet, updateCabinet, delCabinet } from "@/api/device/cabinet";
import { listCabinetType } from "@/api/device/cabinetType";
import { ElMessage, ElMessageBox } from "element-plus";

// 定义分页列表数据模型
const cabinetList = ref([]);
// 柜机类型列表
const cabinetTypeList = ref([]);
// 定义列表总记录数模型
const total = ref(0);
// 数据加载使用图标
const loading = ref(true);
// 弹框
const open = ref(false);
// 弹出框页面显示名称
const title = ref("");
// 定义批量操作id列表模型
const ids = ref([]);
// 定义多选控制模型
const multiple = ref(true);

// 定义分页参数和条件数据
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    cabinetNo: null,
    name: null
  },
  form: {},
  rules: {
    cabinetNo: [{ required: true, message: "柜机编号不能为空", trigger: "blur" }],
    name: [{ required: true, message: "名称不能为空", trigger: "blur" }],
    cabinetTypeId: [{ required: true, message: "请选择柜机类型", trigger: "change" }],
    totalSlots: [{ required: true, message: "总插槽数量不能为空", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  multiple.value = !selection.length;
}

// 删除按钮操作
function handleDelete(row) {
  const cid = row.id || ids.value;
  ElMessageBox.confirm('是否确认删除柜机数据项？', "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(function() {
    return delCabinet(cid);
  }).then(() => {
    getList();
    ElMessage.success("删除成功");
  }).catch(() => {});
}

// 根据id查询数据回显
function handleUpdate(row) {
  reset();
  const cid = row.id;
  getCabinet(cid).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改柜机";
  });
}

// 新增按钮操作
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加柜机";
}

// 提交表单
function submitForm() {
  if(form.value.id != null) {
    updateCabinet(form.value).then(response => {
      ElMessage.success("修改成功");
      open.value = false;
      getList();
    });
  } else {
    addCabinet(form.value).then(response => {
      ElMessage.success("新增成功");
      open.value = false;
      getList();
    });
  }
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    cabinetNo: null,
    name: null,
    cabinetTypeId: null,
    totalSlots: null,
    freeSlots: null,
    usedSlots: null,
    availableNum: null,
    description: null,
    locationId: null,
    status: "0"
  };
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 分页列表调用
function getList() {
  loading.value = true;
  listCabinet(queryParams.value).then(response => {
    cabinetList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 获取柜机类型列表
function getCabinetTypeList() {
  listCabinetType({ pageNum: 1, pageSize: 100 }).then(response => {
    cabinetTypeList.value = response.rows;
  });
}

// 搜索
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

// 重置
function resetQuery() {
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  queryParams.value.cabinetNo = null;
  queryParams.value.name = null;
  handleQuery();
}

// 初始化
getList();
getCabinetTypeList();
</script>
