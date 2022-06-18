function initialiseText() {
    let text = $('#text').val();
    let textArr = [];
    let initText = '';
    if (text) {
        textArr = text.trim().split(' ');
        for (let i = 0; i < textArr.length; i++) {
            initText += textArr[i].charAt(0).toUpperCase() + textArr[i].slice(1) + (i == textArr.length - 1 ? '' : ' ');
        }
        $('#text').val(initText);
    }
}