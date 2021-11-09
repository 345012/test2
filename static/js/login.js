$('#loginBtn').on('click', function (e) {
    e.preventDefault()
    const username = $('#username').val()
    const password = $('#password').val()
    $.ajax({
        url: '/login',
        type: 'post',
        data: { username, password },
        success(res) {
            console.log(res)
            if (!res.succ) {
                alert(res.msg)
                return
            }
            window.location.href = '/'
        }
    })
    return false
})