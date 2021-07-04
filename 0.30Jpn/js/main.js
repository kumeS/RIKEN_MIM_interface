
$(function() {
    // active要素を出したり消したりする
    $('.toggle-group').children().on('click', function(){
    	if (!this.classList.contains('active')) {
    		$(this).siblings().removeClass('active');
    		$(this).addClass('active');
    	}
    })

    // 言語切り替え
    $('.side-selected-lang').children().on('click', function(){
    	$('html').attr('lang', this.dataset.lang)
    })

    // カラム切り替え
    $('.examples').children().on('click', function(){
        $('#results-container').attr('data-view-type', this.dataset.viewType)
    })

    // icon-firstとicon-secondを選択したら、sendqueryを返す
    $('.icons-second,.icons-first').children().on('click', function(){
        var species = $('.icons-first').find('.active').children('span').data('value');
        var organ = $('.icons-second').find('.active').children('span').data('value');
        if(species !== undefined && organ !== undefined){
            sendQuery(species,organ);
        }
    })
});

function sendQuery(species, organ){
  $.ajax({
    crossDomain: true,
    // SPARQL 検索を呼び出す URL の指定
    url: ('http://clst.multimodal.riken.jp/sparql?graph=clstMultimodalMicrostruct&query=' +
        'SELECT DISTINCT ?s ?thumbnail ?id ?desc ?dzi ' +
        'FROM <http://metadb.riken.jp/db/clstMultimodalMicrostruct> ' +
        'WHERE {' +
            '?s a <http://metadb.riken.jp/db/clstMultimodalMicrostruct/riken/DeepZoomImageDataset> . '  +
            '?s <http://metadb.riken.jp/db/clstMultimodalMicrostruct/ome/experiment> ?exp . ' +
            '?exp <http://metadb.riken.jp/db/clstMultimodalMicrostruct/riken/bioSample> ?samp . ' +
            '?samp <http://purl.obolibrary.org/obo/RO_0002162> <@@species@@> . ' +
            '?samp <http://metadb.riken.jp/db/clstMultimodalMicrostruct/riken/classDerivesFrom> <@@organ@@> . ' +
            '?s <http://xmlns.com/foaf/0.1/thumbnail> ?thumbnail . ' +
            '?s <http://purl.org/dc/elements/1.1/identifier> ?id . ' +
            '?s <http://purl.org/dc/elements/1.1/description> ?desc . ' +
            '?s <http://metadb.riken.jp/db/clstMultimodalMicrostruct/riken/deepZoomImage> ?dzi . ' +
        '}').replace('@@species@@', species).replace('@@organ@@', organ),
    // 結果を JSON 形式で取得するための指定
    dataType: 'json',
    // 返ってきた結果を下記の render 関数に渡す指定
    success: function(json){
        var html, i, data = json.results.bindings;
        
        // 表組みの生成
        //list
        html = '<tbody>';
        for (i = 0; i < data.length; i++){
            var datum = data[i];
            //listの生成文字操作
            var url = datum.s.value;
            var indexOfQuery = url.lastIndexOf('/')
            var item = url.slice(indexOfQuery+1);

            html += '<tr data-href="' + datum.dzi.value + '">' +
            '<td><img src="' + datum.thumbnail.value + '"></td>'+ 
            '<td><p>' + datum.id.value + '</p></td>' +
            '<td><p>' + datum.desc.value + '<p></td>' +
            '<td><a href="' + url + '">' + item + '</a></td>' +
            '</tr>'; 
        }
        html += '</tbody>';
        $('#results-list').children('tbody').remove();
        $('#results-list').append(html);
        //listの行をクリックで遷移させる
        $('[data-href]', '.list-clickable').on('click', function(){
            location.href = $(this).data('href');
        });
        if (data.length === 0) {
            $('#no-results').addClass('show');
        } else {
            $('#no-results').removeClass('show');
        }
        
        //thumbnails
        html = '<ul>';
        for (i = 0; i < data.length; i++){
            var datum = data[i];
            html += '<li class="images-data clearfix" data-href="' + datum.dzi.value + '">' +
            '<img src="' + datum.thumbnail.value + '" class="images">' + 
            '<div class="mask"><p>' + datum.id.value + '</p>' +
            '<p>' + datum.desc.value + '</p>' +
            '<p><a href="' + url + '"></a></p></div>' +
            '</li>';
        }
        html += '</ul>';
        $('#results-thumbnails').children('ul').remove();
        $('#results-thumbnails').append(html);
        //thumbnailsをクリックで遷移させる
        $('[data-href]', '.thumbnails-clickable').on('click', function(){
        location.href = $(this).data('href');   
        });
    },
    xhrFields: {
            withCredentials: true
        }
    });
};
