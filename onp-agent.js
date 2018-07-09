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

	let address = e.target.dataset.onpURL || 'https://open-novel.github.io/#install'

	let player = window.open( address )

	let buf = await ( await fetch( url ) ).arrayBuffer( )

	player.postMessage( { type: 'install-packed', version: '1.1', file: buf }, '*', [ buf ] )

}


window.onp = onp

}