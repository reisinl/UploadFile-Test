/**
 * Create Modal
 */
var modal = document.querySelector(".modals");

/**
 * Create Modal Trigger
 */
var trigger = document.querySelector(".trigger");

/**
 * Create Close Modal Trigger For Close Button
 */
var closeButton = document.querySelector(".close-button");

/**
 * Modal toggle
 */
function toggleModal() {
    modal.classList.toggle("show-modal");
}

/**
 * Add Button Trigger
 */
trigger.addEventListener("click", toggleModal);

/**
 * Add Close Button Trigger
 */
closeButton.addEventListener("click", toggleModal);

/**
 * For Id Createment
 */
var fileId = 0;

/**
 * Open File Browser to Select Files
 * Make Upload Files List
 */
var browserFiles = function (){
    // $("#input-file").click();
    let fileElement = document.createElement("input");
    fileElement.setAttribute("type", "file");
    fileElement.setAttribute("style", "display:none");
    fileElement.setAttribute("id", fileId);
    $("#table-progress").append(fileElement);
    $(fileElement).click();

    var modal = document.querySelector(".modals");
    modal.classList.toggle("show-modal");
    $(fileElement).on('change', function(event) {
        //console.log(event);
        var files = event.target.files;
        $(files).each(function(index, val){
            $("#text-areas-files").val(val.name);
            createUploadFileList(fileElement);
        })
    });
    toggleModal();
    fileId++;
}

/**
 * File Loader
 */
var loader;
/**
 * ProgressBar in Process
 * */
var currentProgress;

/**
 * Create Upload Files List
 *
 */
var createUploadFileList = function (fileElement) {
    let files = $(fileElement).prop('files');
    let file = files[0];

    let date = new Date();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();
    let currentDate = day + "/" + month + "/" + year;
    let trElement = document.createElement("tr");
    let tdDateElement = document.createElement("td");
    tdDateElement.setAttribute("width", "20%");
    let dateNode = document.createTextNode(currentDate);
    tdDateElement.append(dateNode);

    let tdFileNm = document.createElement("td");
    tdFileNm.setAttribute("width", "25%");
    let fileNmNode = document.createTextNode(file.name);
    tdFileNm.append(fileNmNode);

    let tdProgress = document.createElement("td");
    tdProgress.setAttribute("class", "progress-td")

    trElement.append(tdDateElement);
    trElement.append(tdFileNm);
    trElement.append(tdProgress);

    $("#table-progress").append(trElement);
}

/**
 * Upload File Counter
 */
var uploadedCnt = 0;

/**
 * Read Files
 * create progress bar and progress image
 */
var readFiles = function () {
    let index = uploadedCnt;
    if (uploadRequired()) {
        let files = $("input[type=file]");
        if (files.length -1 >= index) {
            let file = $(files[index]).prop("files")[0];
            if (file) {

                let divProgress = document.createElement("div");
                divProgress.setAttribute("class", "div-progress");
                let divSpan = document.createElement("span");
                divProgress.append(divSpan);
                $(".progress-td")[index].append(divProgress);

                let divImage = document.createElement("div");
                divImage.setAttribute("class", "div-image");
                let imgElement = document.createElement("img");
                imgElement.setAttribute("src", "images/cancel.png");
                imgElement.setAttribute("id", "img-" + index);
                imgElement.setAttribute("onclick", "uploadAbort(this)");
                divImage.append(imgElement);

                $(".progress-td")[index].append(divImage);

                currentProgress = divSpan;
                doFileLoader(file, divSpan, index);
            }
        }

    }
}

/**
 * Load Files and Read Files
 * */
var doFileLoader = function (file, progress, index) {
    let events = {
        load: function () {
            console.log('file is loaded');
        },
        progress: function (percent) {
            progress.style.width = percent + "%";
        },
        success: function () {
            doUploadFile(file, index);
            //let files = $("input[type=file]");
            //let files = $("input[type=file]");

            console.log('file reading complete');
        }
    };

    loader = new FileLoader(file, events);
}

/**
 * Upload Required Check
 * Password is required
 * */
var uploadRequired = function () {
    // password required check
    let pwd = $("#pwd").val();
    if (pwd === "") {
        $(".pwd-required").show();
        return false;
    } else {
        $(".pwd-required").hide();
    }
    return true;
}

/**
 * Upload File to Server
 * */
var doUploadFile = function (file, imgIdx){
    let formData = new FormData();
    let fileName = doEncrypt(file.name);
    formData.append(fileName, file)
    $.ajax({
        url : "upload/",
        type : 'POST',
        data : formData,
        processData : false,
        contentType : false,
        beforeSend:function(){
            console.log("File is ready to upload, please wait");
        },
        success : function(responseStr) {
           $("#img-" + imgIdx).attr("style","width:20px");
           $("#img-" + imgIdx).attr("src", "images/tick.png");
           $("#img-" + imgIdx).removeAttr("onclick");
            uploadedCnt = imgIdx + 1;
            readFiles();

        },
        error : function(responseStr) {
            if (responseStr.status === 403) {
                currentProgress.style.width = "100%";
                currentProgress.style.background = "rgb(238,87,90)";
                $(currentProgress).parent().parent().append("<span class='upload-error'>File Size Error</span>");
                $("#img-" + imgIdx).remove();
            }
            uploadedCnt = imgIdx + 1;
            readFiles();
        }

    });

}

/**
 * Upload abort
 */
var uploadAbort = function(statusImage) {
    this.loader.abort();
    statusImage.style.width = "20px";
    statusImage.src = "images/reupload.png";
    statusImage.setAttribute("onclick", "uploadResume(this)")
    currentProgress.style.width = "100%";
    currentProgress.style.background = "rgb(238,87,90)";
}

var uploadResume = function (statusImage){
    statusImage.style.width = "12px";
    statusImage.src = "images/cancel.png";
    statusImage.setAttribute("onclick", "uploadAbort(this)")
    let files = $("input[type=file]");
    let file = $(files[uploadedCnt]).prop("files")[0];
    currentProgress.style.width = "0%";
    currentProgress.style.background = "rgb(94,240,183)";

    doFileLoader(file, currentProgress, uploadedCnt);
}

/**
 * Encrypt Msg
 */
var doEncrypt = function (msg){
    msg = nacl.util.decodeUTF8(msg);
    // Todo
    //$("#pwd").val()
    let nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    let key = nacl.randomBytes(nacl.secretbox.keyLength);
    let cipherText = nacl.secretbox(msg, nonce, key);
    return cipherText;
}


/*
* FileReader module
* file  object file
* events callback object including success, load, progress
*/
var FileLoader = function (file, events) {
    this.reader = new FileReader();
    this.file = file;
    this.loaded = 0;
    this.total = file.size;
    this.step = 1024 * 10;
    this.events = events || {};
    this.readBlob(0);
    this.bindEvent();
}

FileLoader.prototype = {
    bindEvent: function (events) {
        let _this = this,
            reader = this.reader;

        reader.onload = function (e) {
            _this.onLoad();
        };

        reader.onprogress = function (e) {
            _this.onProgress(e.loaded);
        };
    },
    // progress callback
    onProgress: function (loaded) {
        let percent;

        let handler = this.events.progress;//进度条

        this.loaded += loaded;
        percent = (this.loaded / this.total) * 100;
        handler && handler(percent);
    },
    // reading finished
    onLoad: function () {
        let handler = this.events.load;

        // send the content of the reading result
        handler && handler(this.reader.result);

        // if unfinished, continue
        if (this.loaded < this.total) {
            this.readBlob(this.loaded);
        } else {
            // reading finish
            this.loaded = this.total;
            // if success, callback success event
            this.events.success && this.events.success();
        }
    },
    // read the content of the file
    readBlob: function (start) {
        let blob,
            file = this.file;

        // if support slice, read the file piece by piece, otherwise read the whole file at one time
        if (file.slice) {
            blob = file.slice(start, start + this.step);
        } else {
            blob = file;
        }

        this.reader.readAsText(blob);
    },
    // reading abort
    abort: function () {
        let reader = this.reader;
        if(reader) {
            reader.abort();
        }
    }
}