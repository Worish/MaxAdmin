function showMessage(title, message) {
    iziToast.show({
        class: 'test',
        titleColor: '#fff',
        color: '#d66061',
        icon: 'icon-contacts',
        title: title,
        message: message,
        position: 'topCenter',
        transitionIn: 'flipInX',
        transitionOut: 'flipOutX',
        progressBarColor: 'rgb(0, 255, 184)',
        image: './img/avatar.jpg',
        timeout: 1000,
        imageWidth: 70,
        layout: 2,
        onClose: function() {
            console.info('onClose');
        },
        iconColor: 'rgb(0, 255, 184)'
    });
}
