<template>
  <v-layout>
    <v-flex xs12 sm10 offset-sm1>
      <v-card v-if="loadingProjectList">
        <v-card-text>正在載入專案清單...</v-card-text>
        <v-progress-linear indeterminate fixed></v-progress-linear>
      </v-card>

      <v-card>
        <v-list v-if="!loadingProjectList">
          <v-subheader inset>點選專案名稱進入設定</v-subheader>
          <v-list-tile v-for="(projectName, i) in projectLists" :key="i+1" @click ripple>
            <v-list-tile-content @click="viewProject(projectName),getProjectFrame(projectName)">
              <v-list-tile-title>{{projectName}}</v-list-tile-title>
            </v-list-tile-content>

            <v-list-tile-action>
              <v-btn icon ripple @click="deleteProjectDialog(projectName)">
                <v-icon color="grey lighten-1">delete</v-icon>
              </v-btn>
            </v-list-tile-action>
          </v-list-tile>
          <v-btn
                absolute
                dark
                fab
                top
                right
                color="dark"
                @click="addProjectDialog = true"
              >
                <v-icon>add</v-icon>
              </v-btn>
        </v-list>
         
      </v-card>
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

      <v-dialog
        v-model="viewProjectDialog"
        fullscreen
        scrollable
        persistent
        transition="dialog-bottom-transition"
      >
        <v-card>
          <v-toolbar dark color="primary">
            <v-toolbar-title>專案：{{viewProjectName}} 的設定</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn dark flat @click="viewProjectDialog = false">關閉</v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <v-list three-line subheader>
            <v-subheader>選項</v-subheader>

            <v-list-tile avatar>
              <v-list-tile-content>
                <v-btn
                  color="blue-grey"
                  class="white--text"
                  @click="uploadFileDialog = true,$refs.button.clear()"
                >
                  Upload
                  <v-icon right dark>cloud_upload</v-icon>
                </v-btn>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>

          <v-divider></v-divider>

          <v-list three-line subheader>
            <v-subheader>現有的圖匡</v-subheader>

            <v-layout justify-center>
              <v-flex xs12 sm12>
                <v-card>
                  <v-container fluid grid-list-md>
                    <v-layout row wrap>
                      <v-flex v-for="frame in frameLists" :key="frame.title" xs3>
                        <v-card>
                          <v-img
                            :src="frame.src"
                            height="200px"
                            @click="viewFrameDialog(frame.src)"
                          >
                            <v-container fill-height fluid pa-2>
                              <v-layout fill-height>
                                <v-flex xs12 align-end flexbox></v-flex>
                              </v-layout>
                            </v-container>
                          </v-img>

                          <v-card-actions>
                            <span class="headline black--text" v-text="frame.title"></span>
                            <v-spacer></v-spacer>
                            <v-btn icon @click="deleteProjectFrameDialog(frame.title)">
                              <v-icon>delete</v-icon>
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card>
              </v-flex>
            </v-layout>
          </v-list>
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

      <v-dialog v-model="uploadFileDialog" max-width="500px">
        <v-card>
          <v-card-title>上傳檔案到 專案:{{viewProjectName}}</v-card-title>
          <v-subheader>上傳檔案僅限PNG格式</v-subheader>
          <v-card-text>
            <upload-btn title="點擊來選擇檔案" accept=".png" @file-update="updateFileBtn" ref="button"></upload-btn>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="uploadFrame(viewProjectName)">上傳</v-btn>
            <v-btn color="red" @click="uploadFileDialog = false">取消</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="uploadingDialog" persistent width="300">
        <v-card color="primary" dark>
          <v-card-text>
            正在上傳....請稍等！
            <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
          </v-card-text>
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

      <v-dialog v-model="deleteProjectFrameConfirmDialog" max-width="300px">
        <v-card>
          <v-card-title>確認刪除圖框:{{delProjectFrameName}}?</v-card-title>
          <v-card-actions>
            <v-btn color="red" @click="delProjectFrame(viewProjectName,delProjectFrameName)">確認</v-btn>
            <v-btn color="primary" @click="deleteProjectFrameConfirmDialog = false">取消</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="frameDialog" max-width="900px">
        <v-card>
          <v-img :src="frameDialogURL" height="600px" @click="frameDialog=false"></v-img>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="uploadSucceed" :timeout="3000">
        上傳成功！
        <v-btn color="pink" flat @click="uploadSucceed = false">關閉</v-btn>
      </v-snackbar>
    </v-flex>
  </v-layout>
</template>

<script>
const axios = require("axios");
import UploadButton from "vuetify-upload-button";
import { Ripple } from "vuetify/lib/directives";

export default {
  data() {
    return {
      addProjectName: null,
       addProjectDialog: false,
      projectLists: {},
      deleteProjectConfirmDialog: false,
      deleteProjectFrameConfirmDialog: false,
      loadingProjectList: true,
      errorDialog: false,
      delProjectName: null,
      delProjectFrameName: null,
      errorCode: "No Error!",
      viewProjectDialog: false,
      viewProjectName: null,
      uploadFileDialog: false,
      frameToUpload: {},
      uploadSucceed: false,
      uploadingDialog: false,
      frameLists: [],
      frameDialog: false,
      frameDialogURL: ""
    };
  },
  components: {
    "upload-btn": UploadButton
  },
  directives: {
    Ripple
  },
  mounted() {
    this.getProjectList();
  },

  uploadFrame: {},
  methods: {
     addProject(addprojectName) {
      axios
        .post("/api/project/addProject", { projectName: addprojectName })
        .then(response => {
          this.addProjectDialog = false;
          this.addProjectName = "";
          this.getProjectList();
        })
        .catch(error => {
          this.errorDialog = true;
          this.errorCode = error;
          console.log(error);
        });
    },
    deleteProjectFrameDialog(delProjectFrameName) {
      this.deleteProjectFrameConfirmDialog = true;
      this.delProjectFrameName = delProjectFrameName;
    },
    delProjectFrame(projectName, frameName) {
      axios
        .post("/api/project/delProjectFrame", {
          projectName: projectName,
          frameName: frameName
        })
        .then(response => {
          this.getProjectFrame(projectName);
          this.deleteProjectFrameConfirmDialog = false;
        })
        .catch(error => {
          this.errorDialog = true;
          this.errorCode = error;
          console.log(error);
        });
    },
    viewFrameDialog(url) {
      this.frameDialog = true;
      this.frameDialogURL = url;
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
        })
        .catch(error => {
          this.errorDialog = true;
          this.errorCode = error;
          console.log(error);
        });
    },
    updateFileBtn(file) {
      this.frameToUpload = file;
    },
    uploadFrame(projectName) {
      this.uploadingDialog = true;
      let formData = new FormData();
      formData.append("file", this.frameToUpload);
      formData.append("projectName", projectName);
      axios
        .post("/api/project/frameUpload", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(response => {
          this.uploadingDialog = false;
          console.log("SUCCESS!!");
          this.uploadFileDialog = false;
          this.uploadSucceed = true;
          this.getProjectFrame(projectName);
        })
        .catch(error => {
          this.errorDialog = true;
          this.errorCode = error;
          console.log(error);
        });
    },
    viewProject(projectName) {
      this.viewProjectDialog = true;
      this.viewProjectName = projectName;
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
          this.deleteProjectConfirmDialog = false;
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
    }
  }
};
</script>

<style>
</style>
