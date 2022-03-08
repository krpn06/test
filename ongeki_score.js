const wait = 200

let master_num = 0
let lunatic_num = 0
let finish = 0
let ptotal = 0
var player = {name:"ＴＡＫＥＲＵＮ", s6:0, s5h:0, s5:0}
var master_pmax_json = []
var lunatic_pmax_json = []
var ranking_json = []
var ranking_player = ["ＴＡＫＥＲＵＮ", "ＦＡＬＬ＊ＵＭＲ"]
var crawler_list = []
var music_ranking_master = []
var total_p_score_ranking = []
var result_area_html = '<div style="background-color:rgb(255,255,255);border-radius:10px;margin: 30px;padding: 10px;"><div id="disp_result_area"></div></div>'

const URL1 = "https://script.google.com/macros/s/AKfycbz4B5y4ZF03gRXK_eitEuozy4ZfzqtOALLfLFl-f-efzrzGVU-FjbVpFlvgeYPmmfQ/exec";

function save_csv(data) {
    let blob = new Blob([json2csv(data)], {type: 'text/csv'});
    let url  = URL.createObjectURL(blob);

    let a = document.createElement("a");

    a.href = url;
    a.target = '_blank';
    a.download = 'ongeki_score.csv';

    a.click();
}

function save_json(data, filename) {
    let blob = new Blob([JSON.stringify(data, null, '  ')], {type: 'application\/json'});
    let url  = URL.createObjectURL(blob);

    let a = document.createElement("a");

    a.href = url;
    a.target = '_blank';
    a.download = filename + '.txt';

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
                let difficult = "MASTER";
                master_num++

                const id = $('input[name="idx"]', element).val()
                const name = $('.music_label', element).text()
                const level = $('.score_level', element).text()
                let data = {
                    id: id,
                    difficult:3, //master
                    level:level,
                    name:name,
                }
                crawler_list.push(data)
            });
            setTimeout(detail_crawler, wait, crawler_list)

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
                lunatic_num++

                //console.log($('.music_label', element).text())
                const id = $('input[name="idx"]', element).val()
                const name = $('.music_label', element).text()
                const level = $('.score_level', element).text()
                let data = {
                    id: id,
                    difficult:10, //lunatic
                    level:level,
                    name:name,
                }
                crawler_list.push(data)
            });
            setTimeout(detail_crawler, wait, crawler_list)

        })
    }
    return get_recursion
}

function make_crawler() {
    let crawl_id = 0

    var music_ranking = []
    get_recursion = function (crawler_list) {
        //console.log(crawl_id)
        if(crawl_id == crawler_list.length) return
        $.ajax({
            type: "GET",
            url: "https://ongeki-net.com/ongeki-mobile/ranking/musicRankingDetail/?idx=" + crawler_list[crawl_id].id + "&scoreType=5&rankingType=99&diff=" + crawler_list[crawl_id].difficult,
            data: {idx: crawler_list[crawl_id].id},
            async: false,
            //contentType: "text/html; charset=EUC-JP",
            dataType: "html"
        }).done(response => {
            let obj = $('.m_5.p_5.t_l tr', response)
            let title = $('.music_label.p_5.break', response).text()
            let level = $('.score_level.t_c', response).text()
            let genre = $('.t_r.f_12.main_color', response).text()
            let pmax = $('.t_r.p_5.f_18.f_b', response).text().replace(/.*\//, '').replace(/[^0-9]/g, '')
            let ranking = {}
            ranking["曲名"] = title
            ranking["レベル"] = level
            ranking["ジャンル"] = genre
            if (crawler_list[crawl_id].difficult == 3){
                ranking["難易度"] = "MASTER"
            } else {
                ranking["難易度"] = "LUNATIC"
            }
            //alert(pmax)
            let data1 = {
                data: title,
                pmax: Number(pmax)
            }
            music_ranking.push(data1)
            if (crawler_list[crawl_id].difficult == 3) {
                master_pmax_json.push(data1)
            } else {
                lunatic_pmax_json.push(data1)
            }

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

                if(index == 0) {
                    ranking["TOP"] = data.pscore
                    ranking["PLAYER"] = data.name
                    ranking["P-MAX"] = data.pmax
                    for(let i = 0; i < ranking_player.length; i++) {
                        ranking[ranking_player[i]] = 0
                    }
                }
                for (let i = 0; i < ranking_player.length; i++){
                    if (data.name == ranking_player[i]) {
                        ranking[data.name] = data.pscore
                    }
                }
                music_ranking.push(data)
            });

            ranking_json.push(ranking);
            crawl_id++
            $("#disp_result_area").html("ランキングデータ取得中...<br>" + crawl_id + "/" + crawler_list.length)

            //master_num = 0

            if (crawl_id < master_num + lunatic_num) {
                setTimeout(get_recursion, wait, crawler_list)
            } else {
                finish++
            }

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

            $("#disp_result_area").html("Pスコ対戦更新完了！")

            var SendDATA = {
                "sheetName": "ランキングデータ" ,
                "music_num": master_num + lunatic_num,
                "player": ranking_player,
                "rows": ranking_json
            };

            //save_json(SendDATA, "RankingData")

            var postparam =
                {
                    "method"     : "POST",
                    "mode"       : "no-cors",
                    "Content-Type" : "application/x-www-form-urlencoded",
                    "body" : JSON.stringify(SendDATA)
                };

            fetch(URL1, postparam);

        }
        return
    }
    return get_recursion
}

loadScript("https://code.jquery.com/jquery-3.2.1.min.js", function() {
    $(".wrapper").append(result_area_html);
    detail_crawler = make_crawler()
    page_crawler = make_page_crawler(detail_crawler)
    page_crawler()
})

