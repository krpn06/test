let wait = 500
let master_num = 0
let finish = 0
let ptotal = 0
var player = {name:"ＴＡＫＥＲＵＮ", s6:0, s5h:0, s5:0}
var crawler_list = []
var music_ranking_master = []
var music_ranking_master2 = []
var total_p_score_ranking = []
var result_area_html = '<div style="background-color:rgb(255,255,255);border-radius:10px;margin: 30px;padding: 10px;"><div id="disp_result_area"></div></div>'
var level_list = [
    {id:1, name:"0"},
    {id:3, name:"1"},
    {id:5, name:"2"},
    {id:7, name:"3"},
    {id:9, name:"4"},
    {id:11, name:"5"},
    {id:13, name:"6"},
    {id:14, name:"6.5"},
    {id:15, name:"7"},
    {id:16, name:"7.5"},
    {id:17, name:"8"},
    {id:18, name:"8.5"},
    {id:19, name:"9"},
    {id:20, name:"9.5"},
    {id:21, name:"10"},
    {id:22, name:"10.5"},
    {id:23, name:"11"},
    {id:24, name:"11.5"},
    {id:25, name:"12"},
    {id:26, name:"12.5"},
    {id:27, name:"13"},
    {id:28, name:"13.5"},
    {id:29, name:"14"},
    {id:30, name:"14.5"},
    {id:31, name:"15"},
]

function save_csv(data) {
    let blob = new Blob([json2csv(data)], {type: 'text/csv'});
    let url  = URL.createObjectURL(blob);

    let a = document.createElement("a");

    a.href = url;
    a.target = '_blank';
    a.download = 'ongeki_score.csv';

    a.click();
}

function json2csv(json) {
    let header = Object.keys(json[0]).join(',') + "\n";

    let body = json.map(function(d){
        return Object.keys(d).map(function(key) {
            return d[key];
        }).join(',');
    }).join("\n");

    return body;
}

function loadScript(src, callback) {
    let done = false;
    let head = document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.src = src;
    head.appendChild(script);
    // Attach handlers for all browsers
    script.onload = script.onreadystatechange = function() {
        if ( !done && (!this.readyState ||
            this.readyState === "loaded" || this.readyState === "complete") ) {
            done = true;
            callback();
            // Handle memory leak in IE
            script.onload = script.onreadystatechange = null;
            if ( head && script.parentNode ) {
                head.removeChild( script );
            }
        }
    };
}
function make_page_crawler(detail_crawler) {
    let crawl_id = 0;
    let get_recursion = function() {
        $.ajax({
            type:"GET",
            //contentType: "text/html; charset=EUC-JP",
            url:"https://ongeki-net.com/ongeki-mobile/ranking/search/?genre=99&scoreType=5&rankingType=99&diff=3",
            async: false,
            dataType:"html"
        }).done(response => {
            let obj = $('.container3 form', response)

            obj.each((index,element) => {
                let difficult;
                if ($('img:nth-child(2)', element)[0].src.match(/master/)) {
                    difficult = "MASTER"
                    master_num++
                } else if ($('img:nth-child(2)', element)[0].src.match(/lunatic/)) {
                    difficult = "LUNATIC"
                }
                //console.log($('.music_label', element).text())
                const id = $('input[name="idx"]', element).val()
                const name = $('.music_label', element).text()
                const level = $('.score_level', element).text()
                let data = {
                    id: id,
                    difficult:difficult,
                    level:level,
                    name:name,
                }
                console.log(data)
                crawler_list.push(data)
            });
            $("#disp_result_area").html("取得リストの作成中<br>"+crawl_id+"ページ目取得完了")

            crawl_id++

            if (crawl_id < 1) {
                //setTimeout(detail_crawler, wait, crawler_list)
                setTimeout(get_recursion, wait)
            } else {
                //save_csv(crawler_list)
                setTimeout(detail_crawler, wait, crawler_list)
            }
        })

        $.ajax({
            type:"GET",
            //contentType: "text/html; charset=EUC-JP",
            url:"https://ongeki-net.com/ongeki-mobile/ranking/search/?genre=99&scoreType=5&rankingType=99&diff=10",
            async: false,
            dataType:"html"
        }).done(response => {
            let obj = $('.container3 form', response)

            obj.each((index,element) => {
                let difficult;
                if ($('img:nth-child(2)', element)[0].src.match(/master/)) {
                    difficult = "MASTER"
                    master_num++
                } else if ($('img:nth-child(2)', element)[0].src.match(/lunatic/)) {
                    difficult = "LUNATIC"
                }
                //console.log($('.music_label', element).text())
                const id = $('input[name="idx"]', element).val()
                const name = $('.music_label', element).text()
                const level = $('.score_level', element).text()
                let data = {
                    id: id,
                    difficult:difficult,
                    level:level,
                    name:name,
                }
                console.log(data)
                crawler_list.push(data)
            });
            $("#disp_result_area").html("取得リストの作成中<br>"+crawl_id+"ページ目取得完了")

            crawl_id++

            if (crawl_id < 1) {
                //setTimeout(detail_crawler, wait, crawler_list)
                setTimeout(get_recursion, wait)
            } else {
                //save_csv(crawler_list)
                setTimeout(detail_crawler, wait, crawler_list)
            }
        })
    }
    return get_recursion
}

function make_crawler() {
    let crawl_id = 0

    var music_ranking = []
    get_recursion = function (crawler_list) {
        //console.log(crawl_id)
        $.ajax({
            type: "GET",
            url: "https://ongeki-net.com/ongeki-mobile/ranking/musicRankingDetail/?idx=" + crawler_list[crawl_id].id + "&scoreType=5&rankingType=99&diff=3",
            data: {idx: crawler_list[crawl_id].id},
            async: false,
            //contentType: "text/html; charset=EUC-JP",
            dataType: "html"
        }).done(response => {
            let obj = $('.border_block.master_score_back.m_5.p_5.t_l tr', response)
            let title = $('.music_label.p_5.break', response).text()
            let pmax = $('.t_r.p_5.f_18.f_b', response).text().replace(/.*\//, '').replace(/[^0-9]/g, '')
            //alert(pmax)
            let data1 = {
                data: title,
                pmax: Number(pmax)
            }
            music_ranking.push(data1)

            obj.each((index, element) => {
                let player_name;
                let platinum_score;
                player_name = $('.t_l', element).text()
                platinum_score = Number($('.f_18', element).text().replace(/,/, ''))
                let data = {
                    name: player_name,
                    pscore: platinum_score,
                    pmax: Number(pmax)
                }

                music_ranking.push(data)
            });

            crawl_id++
            if(crawl_id > master_num) return
            $("#disp_result_area").html("取得リストの作成中<br>" + crawl_id + "ページ目取得完了")

                //if (crawl_id < master_num) {
            if (crawl_id < master_num) {
                setTimeout(get_recursion, 200, crawler_list)

            } else {
                finish++
            }

            /*
            get_detail_data(response,crawler_list[crawl_id])
            crawl_id++
            if (crawl_id < crawler_list.length) {
                setTimeout(get_recursion, wait, crawler_list)
                //save_csv(score_csv_data)
            } else {
                //save_csv(score_csv_data)
            }
            */
        })
        if (finish === 1) {
            finish++


            let num = 0;

            while (num < music_ranking.length) {
                music_ranking_master.push(music_ranking[num])
                num++
            }
            // ランキングから曲名を削除
            num = 0
            while (num < music_ranking_master.length) {
                if (music_ranking_master[num].data) {
                    ptotal += music_ranking_master[num].pmax
                }
                num++
            }
            console.log(music_ranking_master)
            for (let i = 0; i < music_ranking_master.length; i++) {
                if (music_ranking_master[i].data) {
                    continue;
                }
                for (let j = 0; j < total_p_score_ranking.length; j++) {
                    if (music_ranking_master[i].name === total_p_score_ranking[j].name) {
                        total_p_score_ranking[j].pscore += music_ranking_master[i].pscore
                        if (music_ranking_master[i].name === "ＴＡＫＥＲＵＮ") {
                            let p = music_ranking_master[i].pscore / music_ranking_master[i].pmax
                            if(p >= 0.99){
                                player.s6++
                                player.s5h++
                                player.s5++
                            } else if (p >= 0.98) {
                                player.s5h++
                                player.s5++
                            } else if (p >= 0.97) {
                                player.s5++
                            }
                        }
                        break;
                    }
                }
                total_p_score_ranking.push(music_ranking_master[i])
            }

            function compare(a, b) {
                const numA = a.pscore;
                const numB = b.pscore;

                return (numA - numB) * -1;
            }

            total_p_score_ranking.sort(compare);


            console.log(total_p_score_ranking)
            save_csv(total_p_score_ranking)
            //alert(ptotal)

            $("#disp_result_area").html("")
            $("#disp_result_area").append("PLATINUM SCORE RANKING<br>")
            $("#disp_result_area").append("MAX : " + ptotal + "<br><br>")
            $("#disp_result_area").append(player.name + "  ☆6(99%):" + player.s6 + "/" + master_num + " ☆5.5(98%):" + player.s5h + "/" + master_num + " ☆5(97%):" + player.s5 + "/" + master_num + "<br><br>")
            for(let i = 0; i < 100; i++){
                $("#disp_result_area").append(Number(i + 1) + ". " + total_p_score_ranking[i].name + " " + total_p_score_ranking[i].pscore + "<br>")
            }

            return
        }

    }
    return get_recursion
}

loadScript("https://code.jquery.com/jquery-3.2.1.min.js", function() {
    $(".wrapper").append(result_area_html);
    detail_crawler = make_crawler()
    page_crawler = make_page_crawler(detail_crawler)
    page_crawler()
})
