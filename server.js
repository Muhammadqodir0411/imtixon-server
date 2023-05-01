const http = require("http");
const fs = require("fs");
const { read, write } = require("./utils/model");
const Express = require("./lib/express");
const { create } = require("domain");

function httpServer(req, res) {
  const app = new Express(req, res);

  app.get("/admin", (req, res) => res.end(JSON.stringify(read("admin"))));

  app.get("/categories", (req, res) => {
    const categories = read("categories");
    const subCategories = read("subCategories");

    categories.map((c) => {
      c.subCategories = subCategories.filter(
        (p) => p.category_id == c.category_id
      );
    });

    res.end(JSON.stringify(categories));
  });

  // app.get("/products", (req, res) => res.end(JSON.stringify([])));

  app.get("/products", async (req, res) => {
    const products = read("products");
    const category = read("categories");
    const subCategories = read("subCategories");

    if (!req.query) {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify([]));
    }

    //1-categoriy
    if (req.query.sub_category_id) {
      console.log(1, req.query.sub_category_id);
      if (req.query && req.query.sub_category_id != "undefined") {
        const subCategoryFilter = await subCategories.filter(
          (items) => items.sub_category_id == req.query.sub_category_id
        );
        subCategoryFilter.map((subId) => {
          subId.categor = products.filter(
            (categor) => categor.sub_category_id == subId.sub_category_id
          );
        });
        res.setHeader("Access-control-allow-origin", "*");
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(subCategoryFilter));
      }
    }
    //2-categoriy
    if (req.query.category_id) {
      if (req.query && req.query.category_id != undefined) {
        const categoryFilter = category.filter(
          (items) => items.category_id == req.query.category_id
        );

        console.log(subCategories);

        categoryFilter.map((subId) => {
          subId.subCategories = subCategories.filter(
            (categor) => categor.category_id == subId.category_id
          );
        });
        res.setHeader("Access-control-allow-origin", "*");
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(categoryFilter));
      }
    }
    //3-categoriy
    if (req.query.model) {
      if (req.query && req.query.model != undefined) {
        const madelFilter = products.filter(
          (items) => items.model == req.query.model
        );
        madelFilter.map((subId) => {
          subId.categor = category.find(
            (categor) => categor.category_id == categor.category_id
          );
          subId.product = subCategories.find(
            (products) =>
              subCategories.sub_category_id == products.sub_category_id
          );
        });
        res.setHeader("Access-control-allow-origin", "*");
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(madelFilter));
      }
    }
  });

  app.get("/subcategories", (req, res) => {
    const products = read("products");
    const subCategories = read("subCategories");
    const categorys = read("categories");

    subCategories.map((c) => {
      c.products = products.filter(
        (p) => p.sub_category_id == c.sub_category_id
      );
    });

    res.end(JSON.stringify(subCategories));
  });

  app.post("/categories", async (req, res) => {
    const categorys = read("categories");

    const { categoryName } = JSON.parse(await req.body);
    console.log(categoryName);

    categorys.push({
      category_id: (categorys.at(-1).category_id + 1) | 1,
      categoryName,
    });

    write("categories", categorys);
    res.setHeader("Access-control-allow-origin", "*");
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ statur: "ok  " }));
  });

  app.put("/categories", async (req, res) => {
    console.log(await req.body);
    try {
      const { category_id, category_name } = JSON.parse(await req.body);

      const categories = read("categories");
      let putcategory = categories.filter(
        (edit) => edit.category_id != category_id
      );

      putcategory.push({ category_id, category_name });

      write("categories", putcategory);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: "ok  " }));
    } catch (error) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: 400, message: error.message }));
      console.log(error);
    }
  });

  app.delete("/categories", async (req, res) => {
    try {
      const { category_id } = JSON.parse(await req.body);

      console.log(category_id);
      const categories = read("categories");
      const categoriesDel = categories.filter(
        (categories) => categories.category_id != category_id
      );

      write("categories", categoriesDel);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: "ok  " }));
    } catch (error) {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: error.message }));
    }
  });
}

http.createServer(httpServer).listen(3000, () => console.log("server runing"));
