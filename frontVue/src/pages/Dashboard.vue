<template>
  <div>
    <v-container grid-list-xl fluid>
      <v-layout row justify-center align-center>
        <v-card class="mx-auto" width="350" height="200">
          <v-card-text>
            <p class="display-1 text--primary">專案管理</p>
            <div id="projectCount">
              <h3>專案總數:</h3>
              <v-progress-circular v-if="loadingProjectCount" indeterminate color="primary"></v-progress-circular>
              <p v-if="!loadingProjectCount">{{projectCount}} 個專案在資料庫中</p>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn dark @click="changeRoute('projectManager', 2)">進入專案管理</v-btn>
          </v-card-actions>
        </v-card>

        <v-card class="mx-auto" width="350" height="200">
          <v-card-text>
            <p class="display-1 text--primary">專案選擇</p>
            <div id="app">
              <h3>目前選擇的專案:</h3>
              <v-progress-circular v-if="loadingProjectSelected" indeterminate color="primary"></v-progress-circular>
              <p v-if="!loadingProjectSelected">{{projectSelected}}</p>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              dark
              @click="projectListDialog=true,getProjectList(),loadingProjectList=true"
            >選擇其他專案</v-btn>
          </v-card-actions>
        </v-card>

        <v-card class="mx-auto" width="350" height="200">
          <v-card-text>
            <p class="display-1 text--primary">即拍即印</p>
            <div id="app">
              <h3>拍照後立即合框</h3>
              <p>需選擇專案和使用相框</p>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn
              dark :loading=ifphotoPrint
              @click="printPhotoselProject=true,getProjectList(),loadingProjectList=true"
            >啟動即拍即印</v-btn>
             <v-btn v-if="ifphotoPrint"
              color="error" 
              @click="stopprintPhoto()"
            >停止</v-btn>
          </v-card-actions>
        </v-card>

        <v-dialog v-model="projectListDialog" width="400px">
          <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>選擇專案</v-card-title>

            <v-progress-circular v-if="loadingProjectList" indeterminate color="primary"></v-progress-circular>

            <v-list v-if="!loadingProjectList">
              <v-list-tile v-for="(projectName, i) in projectLists" :key="i+1" @click ripple>
                <v-list-tile-content @click="setProject(projectName)">
                  <v-list-tile-title>{{projectName}}</v-list-tile-title>
                </v-list-tile-content>

                <v-list-tile-action>
                  <v-btn icon ripple @click="deleteProjectDialog(projectName)">
                    <v-icon color="grey lighten-1">delete</v-icon>
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="light-blue" t @click="addProjectDialog = true">新增專案</v-btn>
              <v-btn color="red" @click="projectListDialog = false">取消</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="addProjectDialog" max-width="300px">
          <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>新增專案</v-card-title>
            <v-card-text>
              輸入專案名稱:
              <v-text-field v-model="addProjectName" label="請輸入專案名稱" single-line></v-text-field>
            </v-card-text>

            <v-card-actions>
              <v-btn color="light-blue" @click="addProject(addProjectName)">確認</v-btn>
              <v-btn color="red" @click="addProjectDialog = false">取消</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="deleteProjectConfirmDialog" max-width="300px">
          <v-card>
            <v-card-title>確認刪除專案:{{delProjectName}}?</v-card-title>
            <v-card-actions>
              <v-btn color="red" @click="delProject(delProjectName)">確認</v-btn>
              <v-btn color="primary" @click="deleteProjectConfirmDialog = false">取消</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="errorDialog" max-width="300px">
          <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>錯誤!</v-card-title>
            {{errorCode}}
            <v-card-actions>
              <v-btn color="red" @click="errorDialog = false">確認</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="printPhotoselProject" max-width="300px">
          <v-card>
            <v-card-title class="headline grey lighten-2" primary-title>即拍即印</v-card-title>
            <v-subheader>請先選擇要監看的專案名稱</v-subheader>
            <v-progress-circular v-if="loadingProjectList" indeterminate color="primary"></v-progress-circular>

            <v-list v-if="!loadingProjectList">
              <v-list-tile v-for="(projectName, i) in projectLists" :key="i+1" @click ripple>
                <v-list-tile-content @click="printPhotoFrame(projectName)">
                  <v-list-tile-title>{{projectName}}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>

            <v-card-actions>
              <v-btn color="red" @click="printPhotoselProject = false">取消</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-dialog v-model="printPhotoselFrame" max-width="1200px">
          <v-layout justify-center>
            <v-flex xs12 sm12>
              <v-card>
                <v-card-title class="headline grey lighten-2" primary-title>即拍即印</v-card-title>
                <v-subheader>選擇要監看的專案圖框</v-subheader>
                <v-progress-circular v-if="loadingProjectFrame" indeterminate color="primary"></v-progress-circular>

                <v-container fluid grid-list-md>
                  <v-layout row wrap>
                    <v-flex v-for="frame in frameLists" :key="frame.title" xs3>
                      <v-card>
                        <v-img :src="frame.src" height="200px" @click="printPhotoSend(frame.title)">
                          <v-container fill-height fluid pa-2>
                            <v-layout fill-height>
                              <v-flex xs12 align-end flexbox></v-flex>
                            </v-layout>
                          </v-container>
                        </v-img>
                        <v-card-actions>
                          <span class="headline black--text" v-text="frame.title"></span>
                          <v-spacer></v-spacer>
                        </v-card-actions>
                      </v-card>
                    </v-flex>
                  </v-layout>
                </v-container>
                <v-btn color="red" @click="printPhotoselFrame = false">取消</v-btn>
              </v-card>
            </v-flex>
          </v-layout>
        </v-dialog>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
const axios = require("axios");
export default {
  data() {
    return {
      projectLists: {},
      loadingProjectCount: true,
      loadingProjectSelected: true,
      loadingProjectList: true,
      deleteProjectConfirmDialog: false,
      addProjectDialog: false,
      projectListDialog: false,
      errorDialog: false,
      errorCode: "No Error!",
      projectName: null,
      projectCount: null,
      projectSelected: null,
      addProjectName: null,
      delProjectName: null,
      printPhotoselProject: false,
      printPhotoProjectName: null,
      printPhotoFrameName: null,
      frameLists: [],
      printPhotoselFrame: false,
      loadingProjectFrame: false,
      ifphotoPrint:false,
    };
  },

  mounted() {
    this.getProjectCount();
    this.getProjectSelected();
    this.ifprintPhoto();
  },
  computed: {},

  methods: {
  ifprintPhoto() {
      axios
        .get("/api/project/ifprintPhoto", {
        })
        .then(response => {
          console.log(response);
          if(response.request.responseText=='1'){
            this.ifphotoPrint=true;
          }else{
            this.ifphotoPrint=false;
          }
        })
        .catch(error => {
          this.errorDialog = true;
          this.errorCode = error;
          console.log(error);
        });
    },
    stopprintPhoto() {
      axios
        .get("/api/project/stopprintPhoto", {
        })
        .then(response => {
          this.ifphotoPrint = false;
        })
        .catch(error => {
          this.errorDialog = true;
          this.errorCode = error;
          console.log(error);
        });
    },
    printPhoto(projectName, frameName) {
      console.log(projectName, frameName);
      axios
        .post("/api/project/printPhoto", {
          projectName: projectName,
          frameName: frameName
        })
        .then(response => {
          this.printPhotoselFrame = false;
          this.ifphotoPrint=true;
        })
        .catch(error => {
          this.errorDialog = true;
          this.errorCode = error;
          console.log(error);
        });
    },
    printPhotoSend(frameName) {
      this.printPhotoFrameName = frameName;
      this.printPhoto(this.printPhotoProjectName, this.printPhotoFrameName);
    },
    getProjectFrame(projectName) {
      axios
        .post("/api/project/getProjectFrame", {
          projectName: projectName,
          apiBaseURL: axios.defaults.baseURL
        })
        .then(response => {
          console.log(axios.defaults.baseURL);
          this.frameLists = response.data.frameLists;
          this.loadingProjectFrame = false;
        })
        .catch(error => {
          this.errorDialog = true;
          this.errorCode = error;
          console.log(error);
        });
    },
    printPhotoFrame(projectName) {
      this.loadingProjectFrame = true;
      this.printPhotoProjectName = projectName;
      this.getProjectFrame(projectName);
      this.printPhotoselProject = false;
      this.printPhotoselFrame = true;
    },
    changeRoute(routeName, selectedIndex) {
      const vm = this;
      vm.selectedIndex = selectedIndex;
      return vm.$router.push({ name: routeName });
    },

    addProject(addprojectName) {
      axios
        .post("/api/project/addProject", { projectName: addprojectName })
        .then(response => {
          this.addProjectDialog = false;
          this.addProjectName = "";
          this.getProjectList();
          this.getProjectCount();
        })
        .catch(error => {
          this.errorDialog = true;
          this.errorCode = error;
          console.log(error);
        });
    },

    deleteProjectDialog(delProjectName) {
      console.log(delProjectName);
      this.deleteProjectConfirmDialog = true;
      this.delProjectName = delProjectName;
    },

    delProject(projectName) {
      axios
        .post("/api/project/delProject", { projectName: projectName })
        .then(response => {
          this.getProjectList();
          this.getProjectCount();
          this.deleteProjectConfirmDialog = false;
        })
        .catch(error => {
          this.errorDialog = true;
          this.errorCode = error;
          console.log(error);
        });
    },

    setProject(projectName) {
      axios
        .post("/api/project/setProject", { projectName: projectName })
        .then(response => {
          this.projectListDialog = false;
          this.getProjectSelected();
        })
        .catch(error => {
          this.errorDialog = true;
          this.errorCode = error;
          console.log(error);
        });
    },

    getProjectList() {
      axios
        .get("/api/project/getlist")
        .then(response => {
          console.log(response.data.projectName);
          this.projectLists = response.data.projectName;
          this.loadingProjectList = false;
        })
        .catch(error => {
          this.errorDialog = true;
          this.errorCode = error;
          console.log(error);
        });
    },

    getProjectCount() {
      axios
        .get("/api/project/getCount")
        .then(response => {
          this.loadingProjectCount = false;
          this.projectCount = response.data.projectCount;
        })
        .catch(error => {
          this.errorDialog = true;
          this.errorCode = error;
          console.log(error);
        });
    },

    getProjectSelected() {
      axios
        .get("/api/project/getSelected")
        .then(response => {
          this.loadingProjectSelected = false;
          this.projectSelected = response.data.projectSelected;
        })
        .catch(error => {
          this.errorDialog = true;
          this.errorCode = error;
          console.log(error);
        });
    }
  }
};
</script>

<style>
</style>
