var express = require('express');
var router = express.Router();
var multer = require('multer');
var fs = require('fs');

const UPLOAD_PATH = './uploads'

var upload = multer({ dest: UPLOAD_PATH})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.param('pwd', function(req, res, next, pwd){
  console.log(pwd);
  if(pwd != 'test') {
    return res.json({
        ret_code: '200',
        msg:'password is not correct'
    });
  } else {
    next();
  }
})

// multitude file upload
router.post('/upload', upload.any(), function (req, res, next) {
    //console.log(req.params);
  const files  = req.files;
  let minSize = 1024 * 102.4;
  let maxSize = 1024 * 1024 * 20;
  let fileSize = files[0].size;
  if (fileSize < minSize || fileSize > maxSize) {
    console.log(fileSize);
      return res.sendStatus(403);
  }

  const response = [];
  const result = new Promise((resolve, reject) => {
    files.map((v) => {
      fs.readFile(v.path, function(err, data) {
        fs.writeFile(`${UPLOAD_PATH}/${v.fieldname}`, data, function(err, data) {
          const result = {
            file: v,
          }
          if (err)  reject(err);
          resolve('success');
        })
      })
    })
  })
  result.then(r => {
    res.send({
      ret_code:200,
      msg: 'upload success',
    })
  }).catch(err => {
    res.json({ err })
  });
})

module.exports = router;
