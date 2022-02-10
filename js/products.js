import { createApp } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js";
import pagination from "./pagination.js";

let productModal = "";
let delProductModal = "";

const apiUrl = "https://vue3-course-api.hexschool.io/";
const apiPath = "annawen";

const app = createApp({
  components: {
    pagination,
  },
  data() {
    return {
      products: [],
      isNew: false,
      tempProduct: {
        imagesUrl: [],
      },
      pagination: {},
    };
  },
  methods: {
    // get產品資料
    getData(page = 1) {
      const url = `${apiUrl}v2/api/${apiPath}/admin/products/?page=${page}`;
      axios
        .get(url)
        .then((res) => {
          this.products = res.data.products;
          this.pagination = res.data.pagination;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 驗證
    checkAdmin() {
      const url = `${apiUrl}v2/api/user/check`;
      axios
        .post(url)
        .then(() => {
          this.getData();
        })
        .catch((err) => {
          console.dir(err);
          window.location = "index.html";
        });
    },
    // 透過參數 isState，來判斷是新增還是編輯還是刪除狀態
    openModal(isState, item) {
      if (isState === "new") {
        // 清空物件的動作
        this.tempProduct = {
          imagesUrl: [],
        };

        this.isNew = true;
        productModal.show();
      } else if (isState === "edit") {
        this.tempProduct = JSON.parse(JSON.stringify(item));
        this.isNew = false;
        productModal.show();
      } else if (isState === "delete") {
        this.tempProduct = { ...item };
        delProductModal.show();
      }
    },
  },
  mounted() {
    // 取出 Token
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)annaToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

    //token存到Authorization
    //在每一次打API時，會預設帶入token
    axios.defaults.headers.common.Authorization = token;
    this.checkAdmin();
  },
});

//新增/編輯產品元件
app.component("productModal", {
  props: ["tempProduct", "isNew"],
  template: "#productModalTemplate",
  methods: {
    updateProduct() {
      let url = `${apiUrl}v2/api/${apiPath}/admin/product`;
      let http = "post";

      if (!this.isNew) {
        url = `${apiUrl}v2/api/${apiPath}/admin/product/${this.tempProduct.id}`;
        http = "put";
      }

      axios[http](url, { data: this.tempProduct })
        .then((res) => {
          alert(res.data.message);
          productModal.hide();
          this.$emit("get-data");
        })
        .catch((err) => alert(err.response.data.message));
    },
    createImages() {
      this.tempProduct.imagesUrl = [];
      this.tempProduct.imagesUrl.push("");
    },
  },
  mounted() {
    productModal = new bootstrap.Modal(document.querySelector("#productModal"));
  },
});

//刪除產品元件
app.component("delProductModal", {
  props: ["tempProduct"],
  template: "#delProductModalTemplate",
  methods: {
    delProduct() {
      const url = `${apiUrl}v2/api/${apiPath}/admin/product/${this.tempProduct.id}`;
      axios
        .delete(url)
        .then((res) => {
          alert(res.data.message);
          delProductModal.hide();
          this.$emit("get-data");
        })
        .catch((err) => {
          console.dir(err);
        });
    },
  },
  mounted() {
    delProductModal = new bootstrap.Modal(
      document.querySelector("#delProductModal")
    );
  },
});

app.mount("#app");
