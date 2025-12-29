<template>
  <div class="app-container">

    <!-- 搜索表单 -->
    <el-form ref="queryRef" :inline="true" label-width="68px">
      <el-form-item label="站点名称" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入站点名称"
            clearable
        />
      </el-form-item>
      <el-form-item label="负责人" prop="headName">
        <el-input
            v-model="queryParams.headName"
            placeholder="请输入负责人"
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
            v-hasPermi="['device:station:add']"
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
    <el-table v-loading="loading" :data="stationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="站点名称" prop="name" width="150"/>
      <el-table-column label="柜机编号" prop="cabinetNo" width="120"/>
      <el-table-column label="费用规则" prop="feeRuleName" width="120"/>
      <el-table-column label="营业时间" prop="businessHours" width="120"/>
      <el-table-column label="完整地址" prop="fullAddress" />
      <el-table-column label="负责人" prop="headName" width="100"/>
      <el-table-column label="联系电话" prop="headPhone" width="120"/>
      <el-table-column label="状态" prop="status" width="80">
        <template #default="scope">
          <el-tag :type="scope.row.status == '1' ? 'success' : 'info'">
            {{ scope.row.status == '1' ? '正常' : '停用' }}
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
    <el-dialog :title="title" v-model="open" width="700px" append-to-body>
      <el-form ref="stationRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="站点名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入站点名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="营业时间" prop="businessHours">
              <el-input v-model="form.businessHours" placeholder="如：09:00-22:00" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="负责人" prop="headName">
              <el-input v-model="form.headName" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="headPhone">
              <el-input v-model="form.headPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input v-model="form.longitude" placeholder="请输入经度" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input v-model="form.latitude" placeholder="请输入纬度" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="完整地址" prop="fullAddress">
          <el-input v-model="form.fullAddress" placeholder="请输入完整地址" />
        </el-form-item>
        <el-form-item label="站点图片" prop="imageUrl">
          <el-input v-model="form.imageUrl" placeholder="请输入图片地址" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="1">正常</el-radio>
            <el-radio label="0">停用</el-radio>
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

<script setup name="Station">
import { listStation, addStation, getStation, updateStation, delStation } from "@/api/device/station";
import { ElMessage, ElMessageBox } from "element-plus";

// 定义分页列表数据模型
const stationList = ref([]);
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
    name: null,
    headName: null
  },
  form: {},
  rules: {
    name: [{ required: true, message: "站点名称不能为空", trigger: "blur" }],
    headName: [{ required: true, message: "负责人不能为空", trigger: "blur" }],
    headPhone: [{ required: true, message: "联系电话不能为空", trigger: "blur" }]
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
  const sid = row.id || ids.value;
  ElMessageBox.confirm('是否确认删除站点数据项？', "系统提示", {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: "warning",
  }).then(function() {
    return delStation(sid);
  }).then(() => {
    getList();
    ElMessage.success("删除成功");
  }).catch(() => {});
}

// 根据id查询数据回显
function handleUpdate(row) {
  reset();
  const sid = row.id;
  getStation(sid).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改站点";
  });
}

// 新增按钮操作
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加站点";
}

// 提交表单
function submitForm() {
  if(form.value.id != null) {
    updateStation(form.value).then(response => {
      ElMessage.success("修改成功");
      open.value = false;
      getList();
    });
  } else {
    addStation(form.value).then(response => {
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
    name: null,
    imageUrl: null,
    businessHours: null,
    longitude: null,
    latitude: null,
    provinceCode: null,
    cityCode: null,
    districtCode: null,
    address: null,
    fullAddress: null,
    headName: null,
    headPhone: null,
    cabinetId: null,
    feeRuleId: null,
    status: "1"
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
  listStation(queryParams.value).then(response => {
    stationList.value = response.rows;
    total.value = response.total;
    loading.value = false;
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
  queryParams.value.name = null;
  queryParams.value.headName = null;
  handleQuery();
}

// 初始化
getList();
</script>
