/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

{

window.addEventListener( 'DOMContentLoaded', ( ) => setTimeout( init, 1 ) )


function init ( ) {

	let elms = Array.from( document.getElementsByClassName( 'onp' ) )

	elms.forEach( e => { e.addEventListener( 'click', onp ) } )

}



async function onp ( e ) {

	e.preventDefault( )
	e.stopPropagation( )

	let url = e.target.getAttribute( 'href' )
	if ( ! url ) return
	url = new URL( url, location.href ).href

	let p = new Promise( ok => {
		window.addEventListener( 'message', e => e.source == player && ok( ) )
	} )

	let address = e.target.dataset.onpURL || 'https://open-novel.github.io/#install'

	let player = window.open( address )

	let type = url.match( /\.zip$/i ) ? 'install-packed' : 'install-folder'

	let buf = null, title = null
	if ( type == 'install-packed' ) {
		let res = await fetch( url )
		if ( res.ok )buf = await res.arrayBuffer( )
	} else {
		if ( url[ url.length - 1 ] != '/' ) url += '/'
		title = url.match( /([^/]+)\/$/ ) [ 1 ]
	}

	await p

	let channel = new MessageChannel
	channel.port1.start( )

	player.postMessage( { type, version: '3.6', url: location.href, title, file: buf }, '*', [ channel.port2 ] )

	channel.port1.addEventListener( 'message', async e => {
		let path = e.data.path.trim( )
		let exts = e.data.extensions

		if( path.match( /^\/|\.\/|\/$/ ) ) return

		let file = null
		async function fetchFile( ext ) {
			let file = null
			try {
				let res = await fetch( new URL( path, url ).href + '.' + ext )
				if ( res.ok ) file = await res.blob( )
			} catch( e ) { }
			return file
		}

		for ( let ext of exts ) {
			file = await fetchFile( ext )
			if ( file ) break
		}

		channel.port1.postMessage( { path, file } )

	} )

}


window.onp = onp

}
