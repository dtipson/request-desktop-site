/*
Enable the "Request Desktop Site" functions on mobile chrome (android and iOS) allow users to see desktop layouts on responsive sites.  Note that this is distinct from "opt out of mobile!" buttons built into your site: this is meant to work with the browser's native opt-in/opt-out functionality.

Since these functions work, in part, by simply spoofing the user agent to pretend to be desktop browsers, all we have to do is just remember that the browser once claimed to be android earlier in the same session and then alter the viewport tag in response to its fib.

Here's an example viewport tag <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"> that we'd be setting to scaleable-yes,max scale=2.  That's just an example of something that works on the site I was building: you should customize the "desktop" viewport content setting to whatever works for your site's needs.  If you wanted, you could stick this code in the head just after the primary viewport tag so that the browser doesn't have to re-render the page so much.  Myself, I prefer to leave it at the bottom, since it's a non-critical, probably rarely used, feature at this point: those people who do use it can handle a little extra repaint time.  I was surprised that the Firefox workaround actually works with the code outside of the head, but it does.

*/
(function(d){
    //quick cookie checker
    function c(k){return(d.cookie.match('(^|; )'+k+'=([^;]*)')||0)[2];}

    var ua = navigator.userAgent, //get the user agent string
        ismobile = / mobile/i.test(ua), //android and firefox mobile both use android in their UA, and both remove it from the UA in their "pretend desktop mode"
        mgecko = !!( / gecko/i.test(ua) && / firefox\//i.test(ua)), //test for firefox
        wasmobile = c('wasmobile') === "was", //save the fact that the browser once claimed to be mobile
        desktopvp = 'user-scalable=yes, maximum-scale=2',
        el;

    if(ismobile && !wasmobile){
        d.cookie = "wasmobile=was"; //if the browser claims to be mobile and doesn't yet have a session cookie saying so, set it
    }
    else if (!ismobile && wasmobile){
        //if the browser once claimed to be mobile but has stopped doing so, change the viewport tag to allow scaling and then to max out at whatever makes sense for your site (could use an ideal max-width if there is one)
        if (mgecko) {
            el = d.createElement('meta');
            el.setAttribute('content',desktopvp);
            el.setAttribute('name','viewport');
            d.getElementsByTagName('head')[0].appendChild( el );
        }else{
            d.getElementsByName('viewport')[0].setAttribute('content',desktopvp); //if not Gecko, we can just update the value directly
        }
    }
}(document));

/*

Some examples of what browsers are doing

iOS (iPad):
Mozilla/5.0 (iPad; CPU OS 7_0_3 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) CriOS/30.0.1599.16 Mobile/11B511 Safari/8536.25 (9E5413BC-7DB8-4B71-B876-69EDA4BAC03D)
request desktop site changes it to:
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_3) AppleWebKit/534.53.11 (KHTML, like Gecko) Version/5.1.3 Safari/534.53.10 (9E5413BC-7DB8-4B71-B876-69EDA4BAC03D)

Chrome for Android:
Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76K) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19
request desktop site changes it to:
Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.45 Safari/535.19



Firefox for Android has a similar feature that does switch the UA in exactly the way that this script should help with. Example:

Mozilla/5.0 (Android; Mobile; rv:25.0) Gecko/25.0 Firefox/25.0
changes to
Mozilla/5.0 (X11; Linux x86_64; rv:25.0) Gecko/20100101 Firefox/25.0

This feature is, however less than ideal in Firefox, at least for the purposes of this script helping users get what they want. Mozilla, in its infinite wisdom, has decided that one terrible practice (redirecting mobile users to an m.domain.org version of a site) deserves another: redirecting users to the apex domain, often losing all information about the page you were just on.  That means that if users are looking at a responsive page and want to "request the desktop version," they will likely end up on the wrong page (homepage) and have to know to go back. But wait, Mozilla sometimes erases the previous history item! Nice.
http://hg.mozilla.org/integration/mozilla-inbound/file/094819a5ee7a/mobile/android/chrome/content/browser.js#l2617

Firefox mobile also ignores javascript-based changes to the content setting on the viewport tag.  But it _does_ seem to react to the addition of a second viewport tag, even if the page has already rendered.  So it requires a special path.

Read more here (may be outdated):
http://www.quirksmode.org/mobile/tableViewport.html#link4

Final caveat: It may be that we need a much stronger, more specific set of regexes to detect this behavior. But as far as I know, no other mobile browsers have UA strings that first include Mobile and then later in the same _session_ do not include it. So it should be a pretty safe opt-in only sort of behavior.

*/