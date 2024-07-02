document.addEventListener('DOMContentLoaded', function() {
    var canvas = new fabric.Canvas('image-editor-canvas');
    var modal = document.getElementById('custom-image-editor-modal');
    var btn = document.getElementById('image-customizer-button');
    var span = document.querySelector('.close-button');
    var frameURL = 'https://dev-workings.pantheonsite.io/wp-content/plugins/image-customizer/assets/img/frame.png'; 
    var font_family = 'Lato'; 
    var font_size = '90';
    var font_weight = '700';
    var frame, userImage, userText;
    fabric.Object.prototype.cornerStyle = 'circle';

    // Load frame image and add it to the canvas
    fabric.Image.fromURL(frameURL, function(img) {
        frame = img.set({ selectable: false, evented: false });
        canvas.add(frame);
        canvas.sendToBack(frame);
    });

    // Open modal on button click
    btn.addEventListener('click', function() {
        modal.style.display = 'block';
    });

    // Close modal on close button click
    span.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    // Variable to hold the userImage
    var userImage = null;

    // Handle image upload
    document.getElementById('image-upload-input').addEventListener('change', function(e) {
        var reader = new FileReader();
        reader.onload = function(event) {
            // Remove previous userImage if exists
            if (userImage) {
                canvas.remove(userImage);
            }
            var imgObj = new Image();
            imgObj.src = event.target.result;
            imgObj.onload = function() {
                userImage = new fabric.Image(imgObj);
                
                // Calculate scale factor to fit the image within the canvas
                var scaleFactor = Math.min(
                    canvas.width / imgObj.width,
                    canvas.height / imgObj.height
                );
                
                // Set scaled dimensions
                var scaledWidth = imgObj.width * scaleFactor;
                var scaledHeight = imgObj.height * scaleFactor;
                
                userImage.set({
                    left: (canvas.width - scaledWidth) / 2,
                    top: (canvas.height - scaledHeight) / 2,
                    scaleX: scaleFactor,
                    scaleY: scaleFactor,
                    borderColor: 'black', 
                    cornerColor: 'black', 
                    cornerSize: 30,
                    transparentCorners: false, 
                    cornerStrokeColor: 'black', 
                    borderOpacityWhenMoving: 1,
                    allowTouchScrolling: true,
                    hasControls: true 
                });

                // Define the circular mask
                var mask = new fabric.Circle({
                    radius: 525, 
                    originX: 'center',
                    originY: 'center',
                    top: canvas.height / 2,
                    left: canvas.width / 2,
                    absolutePositioned: true
                });

                userImage.clipPath = mask;
                // Add the image to the canvas and ensure it is at the bottom layer
                canvas.add(userImage);
                canvas.sendToBack(userImage);

                // Bring the image to the top to ensure controls are on top of other objects
                userImage.bringToFront = function() {
                    canvas.bringToFront(this);
                    this.setCoords(); // Update the object's coordinates to reflect its new position
                };

                // Ensure controls are always on top of other objects when selected
                userImage.on('selected', function() {
                    this.bringToFront();
                });

                // Re-render the canvas
                canvas.renderAll();
            };
        };
        reader.readAsDataURL(e.target.files[0]);
        document.getElementById('remove-image-button').style.display = 'block';
        document.querySelector('.image-controlers').style.display = 'block';
    });

    document.getElementById('remove-image-button').addEventListener('click', function(event) {
        event.preventDefault();
        if (userImage) {
            canvas.remove(userImage);
            userImage = null;
        }
        document.getElementById('remove-image-button').style.display = 'none';
        document.querySelector('.image-controlers').style.display = 'none';
    });

    // Ensure frame is always on top when the mouse leaves the canvas
    document.querySelector('.canvas-div').addEventListener('mouseleave', function() {
        canvas.sendToBack(userImage); 
        canvas.bringToFront(frame);
    });

    // Listen to object:modified event to bring image to front when editing
    canvas.on('object:modified', function(e) {
        var editedObject = e.target;
        if (editedObject === userImage) {
            canvas.bringToFront(userImage);
        }
    });

    // Listen to mouse:down event to deselect image if clicked outside the image
    function allRender(){
        canvas.sendToBack(userImage); 
        canvas.bringToFront(frame);
        canvas.discardActiveObject();
        canvas.renderAll();
    }

    document.querySelector('.field-div').addEventListener('click', function() {
        allRender();
    });

    setInterval(allRender, 5000);

    // Handle text input
    document.getElementById('text-input').addEventListener('input', function(e) {
        var inputText = e.target.value.substring(0, 25); // Limit to 25 characters
    
        var textColor = document.getElementById('text-color-black').classList.contains('active') ? '#000000' : '#FFFFFF';
        var fontColor = document.getElementById('text-color-black').classList.contains('active') ? 'Black' : 'White';
      
        document.getElementById('cwcustomizer_add_your_text').value = inputText;
        document.getElementById('cwcustomizer_font_color').value = fontColor;

        // Define the circular path
        var path = new fabric.Path("M 0 399.996 C 0 92.553 333.351 -99.631 600 54.108 C 723.77 125.454 800 257.31 800 399.996 C 800 707.447 466.663 899.637 200 745.885 C 76.242 674.546 0 542.685 0 399.996", {
            strokeWidth: 1,
            fill: "#00000000",
        });
    
        if (userText) {
            canvas.remove(userText);
        }
            
        userText = new fabric.IText(inputText, {
            left: canvas.width / 2, // Center horizontally on canvas
            top: canvas.height / 2, // Center vertically on canvas
            originX: 'center', // Center horizontally relative to its coordinates
            originY: 'center', // Center vertically relative to its coordinates
            fill: textColor,
            path: path,
            textAlign: 'center',
            pathSide: "left",
            angle: 270,
            fontSize: font_size,
            fontFamily: font_family,
            fontWeight: font_weight,
            selectable: false,
            absolutePositioned: true
        });

        canvas.sendToBack(userImage); 
        canvas.add(userText);
        canvas.renderAll();
    });

    // Handle text color selection
    document.getElementById('text-color-black').addEventListener('click', function() {
        if (userText) {
            userText.set('fill', '#000000');
            canvas.renderAll();
        }
        this.classList.add('active');
        document.getElementById('text-color-white').classList.remove('active');
        document.getElementById('cwcustomizer_font_color').value = 'Black';
    });

    document.getElementById('text-color-white').addEventListener('click', function() {
        if (userText) {
            userText.set('fill', '#FFFFFF');
            canvas.renderAll();
        }
        this.classList.add('active');
        document.getElementById('text-color-black').classList.remove('active');
        document.getElementById('cwcustomizer_font_color').value = 'White';
    });

    // Utility function to prevent default action and execute a callback
    function preventDefaultAndExecute(event, callback) {
        event.preventDefault();
        callback();
    }

    // Helper function to handle repetitive action
    function handleHold(buttonSelector, actionFunction) {
        var interval;
        var button = document.querySelector(buttonSelector);

        button.addEventListener('mousedown', function(event) {
            preventDefaultAndExecute(event, function() {
                actionFunction();
                interval = setInterval(actionFunction, 100); // Repeat every 100 ms
            });
        });

        button.addEventListener('mouseup', function() {
            clearInterval(interval);
        });

        button.addEventListener('mouseleave', function() {
            clearInterval(interval);
        });

        button.addEventListener('touchstart', function(event) {
            preventDefaultAndExecute(event, function() {
                actionFunction();
                interval = setInterval(actionFunction, 100); // Repeat every 100 ms
            });
        });

        button.addEventListener('touchend', function() {
            clearInterval(interval);
        });
    }

    // Handle zoom in
    handleHold('#zoom-in-button', function() {
        if (userImage) {
            userImage.scale(userImage.scaleX * 1.005);
            userImage.scale(userImage.scaleY * 1.005);
            canvas.renderAll();
        }
    });

    // Handle zoom out
    handleHold('#zoom-out-button', function() {
        if (userImage) {
            userImage.scale(userImage.scaleX / 1.005);
            userImage.scale(userImage.scaleY / 1.005);
            canvas.renderAll();
        }
    });

    // Handle rotation clockwise
    handleHold('#rotate-button', function() {
        if (userImage) {
            userImage.set('angle', userImage.angle + 1);
            canvas.renderAll();
        }
    });

    // Handle rotation counter-clockwise
    handleHold('#rotate-button-r', function() {
        if (userImage) {
            userImage.set('angle', userImage.angle - 1);
            canvas.renderAll();
        }
    });

    // Handle movement
    handleHold('#move-up-button', function() {
        moveImage(0, -10);
    });

    handleHold('#move-down-button', function() {
        moveImage(0, 10);
    });

    handleHold('#move-left-button', function() {
        moveImage(-10, 0);
    });

    handleHold('#move-right-button', function() {
        moveImage(10, 0);
    });

    // Move image function
    function moveImage(x, y) {
        if (userImage) {
            userImage.set('left', userImage.left + x);
            userImage.set('top', userImage.top + y);
            userImage.setCoords();
            canvas.renderAll();
        }
    }

    document.getElementById('upload-image-button').addEventListener('click', function() { 
        document.getElementById('image-upload-input').click();
    });

    // Handle adding image to cart
    document.getElementById('add-to-cart-button').addEventListener('click', function(event) {
        event.preventDefault();
        
        var checkboxChecked = document.getElementById('happy-check').checked;
        
        // Remove any existing error messages
        var errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(function(message) {
            message.remove();
        });
        
        if (!userImage || !checkboxChecked) {
            if (!userImage) {
                var imageUploadDiv = document.getElementById('image-upload-div');
                var errorMessage = document.createElement('p');
                errorMessage.className = 'error-message';
                errorMessage.style.color = 'red';
                errorMessage.textContent = 'Image is required';
                imageUploadDiv.insertAdjacentElement('beforebegin', errorMessage);
            }
            if (!checkboxChecked) {
                var happyCheck = document.getElementById('happy-check');
                var errorMessage = document.createElement('p');
                errorMessage.className = 'error-message';
                errorMessage.style.color = 'red';
                errorMessage.textContent = 'You must accept the conditions';
                happyCheck.insertAdjacentElement('beforebegin', errorMessage);
            }
        } else {
            var imageData = canvas.toDataURL('image/png');
            var addYourText = document.getElementById('cwcustomizer_add_your_text').value;
            var fontColor = document.getElementById('cwcustomizer_font_color').value;
            fetch(ajax_object.ajax_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'save_cwcustomizer_image',
                    image_data: imageData,
                    add_your_text: addYourText,
                    font_color: fontColor
                })
            })
            .then(response => response.json())
            .then(response => {
                if (response.success) {
                    // Save the image URL to a hidden field
                    document.getElementById('cwcustomizer_image_data').value = response.data.image_url;
                    // Close the image editor popup and trigger add to cart button
                    document.querySelector('.single_add_to_cart_button').click();
                    modal.style.display = 'none';
                } else {
                    alert('Failed to save image: ' + response.data);
                }
            })
            .catch(error => {
                console.error('Error saving image:', error);
            });
        }
    });
});
