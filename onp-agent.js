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
	url = url.trim( )
	if ( ! url ) return

	let p = new Promise( ok => {
		window.addEventListener( 'message', e => e.source == player && ok( ) )
	} )

	let address = e.target.dataset.onpURL || 'https://open-novel.github.io/#install'

	let player = window.open( address )

	let type = url.match( /\.zip$/i ) ? 'install-packed' : 'install-folder'

	let buf = null, title = null
	if ( type == 'install-packed' ) buf = await ( await fetch( url ) ).arrayBuffer( )
	else {
		if ( url[ url.length - 1 ] != '/' ) url += '/'
		title = url.match( /([^/]+)\/$/ ) [ 1 ]
	}

	await p

	let channel = new MessageChannel
	channel.port1.start( )

	player.postMessage( { type, version: '3.3', url: location.href, title, file: buf }, '*', [ channel.port2 ] )

	channel.port1.addEventListener( 'message', async e => {
		let path = e.data.path.trim( )
		if( path.match( /^\/|\.\/|\/$/ ) ) return

		let file = null
		try {
			file = await ( await fetch( new URL( path, url ) ) ).blob( )
		} catch ( e ) { }

		channel.port1.postMessage( { path, file } )

	} )

}


window.onp = onp

}
