const express = require('express');
const app = express();
const { MongoClient, ObjectId } = require('mongodb');
const methodOverride = require('method-override')

app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs"); //ejs setting
app.use(express.json())



app.use(express.urlencoded({extended:true}))

let db;
const url = 'mongodb+srv://as13ljh:qwer1234@cluster0.jdgwe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
new MongoClient(url).connect().then((client)=>{
  console.log('DB connect success')
  db = client.db('forum') // DB name
  app.listen(8080, () => {
    console.log('sever is running at http://localhost:8080')
  });
}).catch((err)=>{
  console.log(err)
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); //__dirname은 현재 프로젝트의 절대경로
});

app.get('/news', (req, res) => {
  res.send('news')
});

app.get('/list', async (req, res) => {
  let result = await db.collection('post').find().toArray(); // 'forum'이라는 DB에서 'post'라는 컬랙션을 가져옴
  res.render('list.ejs', {posts: result})
});

app.get('/write', (req, res) => {
  res.render('write.ejs')
});

app.post('/add', async (req, res) => {

  try {
    if(req.body.title === "" && req.body.content === ""){
      return res.send('모든값이 비어있다.')
    }else if(req.body.title === ""){
      return res.send('제목이 비어있다.')
    }else if(req.body.content === ""){
      return res.send('내용이 비어있다.')
    }else{
      await db.collection('post').insertOne({
        title: req.body.title,
        content: req.body.content
      });
      res.redirect('/list');  // 데이터 저장 후 목록 페이지로 리다이렉트
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('에러가 발생했습니다.');
  }
});

app.get("/detail/:id", async (req, res) => {
  try {
    // ObjectId 형식이 유효한지 확인
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send('잘못된 ID 형식입니다');
    }

    const result = await db.collection("post").findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!result) {
      return res.status(404).send('게시물을 찾을 수 없습니다');
    }

    res.render("detail.ejs", { result: result });
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 에러가 발생했습니다');
  }

  // const params = req.params
  // console.log(params)
  // const result = await db.collection("post").findOne({_id: new ObjectId(params.id)})
  // console.log(result)
  // res.render("detail.ejs", {result: result});
})

app.get("/edit/:id", async (req, res) => {

  try {
    const result = await db.collection("post").findOne({
      _id: new ObjectId(req.params.id)
    })

    res.render('edit.ejs', {result: result})
  }catch (err){
    console.log(err)
  }
})

app.put('/update/:id', async (req, res) => {

  try {
    if(req.body.title === "" && req.body.content === ""){
      return res.send('모든값이 비어있다.')
    }else if(req.body.title === ""){
      return res.send('제목이 비어있다.')
    }else if(req.body.content === ""){
      return res.send('내용이 비어있다.')
    }else{
      await db.collection('post').updateOne({_id: new ObjectId(req.params.id)}, {$set: { // $set은 덮어쓰기 연산자. $inc 기존값 + 요청값. $mul 기존값 * 요청값. $unset 필드값 삭제.
          title: req.body.title,
          content: req.body.content
        }});
      res.redirect('/list');  // 데이터 저장 후 목록 페이지로 리다이렉트
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('에러가 발생했습니다.');
  }
});
