/* TODO:
 *     ・変更がある場合、beforeunloadで確認する？
 *     ・SITEINFOが増えた場合、ページ分けなどをする必要がある
 */

bg.startup(function(){
	bg.get_all_siteinfo(null, function(res){
		$(function() {
			main(res.SITEINFO);
		});
	});
});

function main(SITEINFO) {
	// スタイルの調整
	$('#SITEINFO').find('.url').parent().removeSpaces();
	$(window).resize(function() {
		$('#SITEINFO .si').find('.url').fullyExtendWidth();
	});
	
	// ユーザーインターフェースの準備
	
	$('#common-commands').removeSpaces()
		.find('.add-si').click(add_si).end()
		.find('.update-all-si').click(update_all_si).end();
	
	const si_temp = $('#SITEINFO .si-temp')
		.find('.title, .url, .code').bind('input', on_si_pre_update).end()
		.find('.open-url').click(on_open_url).end()
		.find('.update').click(on_si_update).end()
		.find('.remove').click(on_si_remove).end()
		.find('.reload').click(on_si_reload).end()
		.find('textarea').adjustHeight().end()
		.find('.commands').removeSpaces().end();
	
	const silent_remove = $('#common-commands .silent-remove').get(0);
	
	// すべてのSITEINFOの編集フォームを追加
	for (var id in SITEINFO) {
		add_si(null, id, SITEINFO[id]);
	}
	
	
	function add_si(evt, id, values) {
		var si = si_temp.clone(true)
			.removeAttr('id')
			.removeClass('dom-template')
			.addClass('si');
		
		if (arguments.length === 1) {
			// 新規IDを割り振る
			si.find('.id').val(Date.now());
		} else {
			si.formValues($.extend(values, {id: id}));
		}
		
		si.appendTo('#SITEINFO')
			// スタイルの調整
			.find('.url').fullyExtendWidth().end()
			.find('textarea').adjustHeight().end();
	}
	
	function update_all_si(evt) {
		var modified_si_elts = $('#SITEINFO .si')
			.filter(function() {
				return ($(this).find('.update:not(:disabled)').length === 1);
			})
			.find('.update:not(:disabled)').attr('disabled', 'disabled').end();
		
		var si_set = {};
		modified_si_elts.each(function() {
			var values = $(this).formValues();
			si_set[values.id] = $.shrink(values, 'id');
		});
		bg.update_siteinfo_set({set: si_set});
	}
	
	
	function on_si_pre_update(evt) {
		// TODO:
		//     ・class="modified"を付与し、この編集判定ハンドラを要素からデタッチする
		//       次にupdateされたときに、再度ハンドラを設定する
		$(this).parents('.si').find('.update').removeAttr('disabled');
	}
	
	function on_open_url(evt) {
		var url = $(this).siblings('.url').val();
		window.open(url);
	}
	
	function on_si_update(evt) {
		$(this).attr('disabled', 'disabled');
		
		var si = $(this).parents('.si'), 
			values = si.formValues();
		bg.update_siteinfo({id: values.id, values: $.shrink(values, 'id')});
	}
	
	function on_si_remove(evt) {
		var si = $(this).parents('.si');
		var values = si.formValues();
		
		var re_empty = /^\s*$/, 
			re_url_empty = /^(?:https?:\/\/)?$/;
		
		var is_empty = (
				re_empty.test(values.title)
				&& re_url_empty.test(values.url)
				&& re_empty.test(values.code)
			);
		
		// 編集フォームが空でない & 削除確認ありの時のみ削除確認する
		if (!is_empty && !silent_remove.checked) {
			if (!confirm('"' + values.title + '" を本当に削除しますか？')) return;
		}
		
		si.remove();
		bg.remove_siteinfo({id: values.id});
	}
	
	function on_si_reload(evt) {
		$(this).siblings('.update').attr('disabled', 'disabled');
		
		var si = $(this).parents('.si');
		bg.get_siteinfo({
			id: si.formValues('id')
		}, function(res) {
			si.formValues(res.values)
				// スタイルの調整
				.find('.url').fullyExtendWidth().end()
				.find('textarea').adjustHeight().end();
		});
	}
}
