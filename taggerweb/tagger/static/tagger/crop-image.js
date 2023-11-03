const alertBox = document.getElementById('alert-box')
const imageBox = document.getElementById('image-box')
const imageForm = document.getElementById('image-form')
const confirmBtn = document.getElementById('confirm-btn')
const input = document.getElementById('id_file')

const csrf = document.getElementsByName('csrfmiddlewaretoken')
const username = document.getElementsByName('username')


function toBlobPromise(croppedCanvas) {
    return new Promise((resolve, reject) => {
        croppedCanvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Failed to convert canvas to blob'));
            }
        });
    });
}


input.addEventListener('change', () => {
    alertBox.innerHTML = ""
    confirmBtn.classList.remove('not-visible')
    const img_data = input.files[0]
    const url = URL.createObjectURL(img_data)

    imageBox.innerHTML = `<img src="${url}" id="image" width="700px">`
    var $image = $('#image')
    console.log($image)

    $image.cropper({
        aspectRatio: 1,
        crop: function (event) {
            console.log(event.detail.x);
            console.log(event.detail.y);
            console.log(event.detail.width);
            console.log(event.detail.height);
            console.log(event.detail.rotate);
            console.log(event.detail.scaleX);
            console.log(event.detail.scaleY);
        }
    });

    var cropper = $image.data('cropper');
    confirmBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const croppedCanvas = cropper.getCroppedCanvas();
        const blob = await toBlobPromise(croppedCanvas);
        const fd = new FormData();
        fd.append('csrfmiddlewaretoken', csrf[0].value);
        fd.append('file', blob, 'cropped.png');
        console.log(username);
        $.ajax({
            type: 'POST',
            url: '/cropimage/'+username[0].value,  // Adjust this to the URL of your Django view
            enctype: 'multipart/form-data',
            data: fd,
            cache: false,
            contentType: false,
            processData: false,
            success: function (response) {
                if (response.status === 'success') {
                    console.log('success', response.message);
                    window.location.href = '/user/'+username[0].value
                } else {
                    console.log('error1', response.message);
                }
            },
            error: function (error) {
                console.log('error2', error);
            }
        })
    })
})
