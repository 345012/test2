const socket = io(`${window.location.search}`, {
    reconnectionDelayMax: 10000,
});
const RankList = []
let myId = null
socket.on('connected', function(id) {
    console.log('🌈 socket connect!')
    myId = id
})

socket.on('disconnect', function(msg) {
    // alert(msg)
    console.log(msg)
    window.location.href = '/login'
})
socket.on('error', function(msg) {
    console.error(msg)
})
socket.on('data', function(data) {
    console.log('data', data)
})

socket.on('message', function (msg) {
    console.log(msg)
})

// new user join
socket.on('join', function(data) {
    if (data._id === myId) { return }
    console.log('join', data)
    rankListInc(data)

    new Notification('Exercise everyday 1minute', {
        body: 'Come on baby!'
    })
})

socket.on('exit', function(id) {
    console.log('exit', id)
    rankListDec(id)
})

// init rank data
socket.on('init/rank', function(data) {
    console.log('init/rank', data)
    const list = Object.keys(data).map(_id => ({
        _id, ...data[_id],
    })).sort(_sortFn)
    RankList.splice(0, 0, ...list)
    renderRankList(list)
})

function _sortFn(a, b) {
    return b.score - a.score
}

const createRankTemplate = (username, score) => 
`<div class="rank-item">
    <div>${username}</div>
    <div class="score">${score}</div>
</div>`

function renderRankList(list = RankList) {
    console.log(list)
    const $$ = $('#rank-list');
    $$.html('')
    list.forEach(({ username, score = 0 }, index) => {
        const elem = createRankTemplate(username, score.toFixed(2));
        $$.append(elem);
    })
}

function rankListInc(data) {
    // const score = data.score;
    // let index = -1;
    // for (let i = 0; i < RankList.length; i++) {
    //     const x = RankList[i];
    //     if (index === -1 && x.score < score) { index = score }
    //     if (x._id === data._id) return
    // }
    // // const index = RankList.findIndex(x => x.score < score)
    // if (index === -1) {
    //     RankList.push(data)
    // } else {
    //     RankList.splice(index, 0, data)
    // }
    RankList.push(data)
    RankList.sort(_sortFn)
    renderRankList()
}

function rankListDec(id) {
    const index = RankList.findIndex(x => x._id === id)
    if (index !== -1) {
        RankList.splice(index, 1)
        renderRankList()
    }
}

if (window.Notification) {
    Notification.requestPermission(function(status) {
        new Notification('Exercise everyday 1minute', {
            body: 'Come on baby!'
        })
    })
} else {
    console.log(`Doesn't Support Notification`)
}