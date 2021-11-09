$('#registerBtn').on('click', function (e) {
    e.preventDefault()
    const username = $('#username').val()
    const password = $('#password').val()
    $.ajax({
        url: '/register',
        type: 'post',
        data: { username, password },
        success(res) {
            console.log(res)
            if (!res.succ) {
                alert(res.msg)
                return
            }
            alert('register successfully!')
            window.location.href = '/login';
        }
    })
    return false
})