const context = await view.getContext();

const modalData = context.extension.modal;

document.getElementById('name').textContent =
    modalData.displayName;

document.getElementById('email').textContent =
    modalData.email;

document.getElementById('region').textContent = 
    modalData.region;