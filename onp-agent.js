/*
These codes are licensed under CC0.
http://creativecommons.org/publicdomain/zero/1.0
*/

{

const version = '5.5'

window.addEventListener( 'DOMContentLoaded', ( ) => setTimeout( init, 1 ) )


function init ( ) {

	let elms = Array.from( document.getElementsByClassName( 'onp' ) )
	elms.forEach( e => { e.addEventListener( 'click', onp ) } )

	if ( ! window.parent ) return
	let player = window.parent

	let titleList = Array.from( elms, e => e.innerText )

	let channel = new MessageChannel
	channel.port1.start( )
	player.postMessage( { type: 'install-list', list: titleList, version, url: location.href }, '*', [ channel.port2 ] )

	channel.port1.addEventListener( 'message', async ( { data } ) => {
		let elm =elms[ data.index ]
		switch ( data.type ) {
			case 'select': {
				onp(  { target: elm }, player )
			} break
			case 'getFile': {
				let url = elm.getAttribute( 'href' )
				if ( ! url ) return
				url = new URL( url, location.href ).href
				sendFile( data, url, channel.port1 )
			}
		}
	} )
}



async function onp ( evt, player ) {

	evt.preventDefault && evt.preventDefault( )
	evt.stopPropagation && evt.stopPropagation( )

	let url = evt.target.getAttribute( 'href' )
	if ( ! url ) return
	url = new URL( url, location.href ).href

	let p
	if ( ! player ) {
		p = new Promise( ok => {
			window.addEventListener( 'message', e => e.source == player && ok( ) )
		} )

		let address = evt.target.dataset.onpURL || 'https://open-novel.github.io/#install'
		player = window.open( address )
	}

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


	player.postMessage( { type, version, url: location.href, title, file: buf }, '*', [ channel.port2 ] )

	channel.port1.addEventListener( 'message', async e => {
		sendFile( e.data, url, channel.port1 )
	} )
}


async function sendFile ( data, url, port ) {

	if ( data.type != 'getFile' ) return
	let path = data.path.trim( )
	let exts = data.extensions

	if( path.match( /(^\/)|(\.\/)|(\/$)|[:]/ ) ) return

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

	port.postMessage( { type: 'install-file', version, path, file } )

}


window.onp = onp

}
