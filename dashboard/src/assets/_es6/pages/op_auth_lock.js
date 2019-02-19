/*
 *  Document   : op_auth_lock.js
 *  Author     : pixelcave
 *  Description: Custom JS code used in Lock Page
 */

class pageAuthLock {
    /*
     * Init Lock Form Validation, for more examples you can check out https://github.com/jzaefferer/jquery-validation
     *
     */
    static initValidation() {
        jQuery('.js-validation-lock').validate({
            errorClass: 'invalid-feedback animated fadeIn',
            errorElement: 'div',
            errorPlacement: (error, el) => {
                jQuery(el).addClass('is-invalid');
                jQuery(el).parents('.form-group').append(error);
            },
            highlight: (el) => {
                jQuery(el).parents('.form-group').find('.is-invalid').removeClass('is-invalid').addClass('is-invalid');
            },
            success: (el) => {
                jQuery(el).parents('.form-group').find('.is-invalid').removeClass('is-invalid');
                jQuery(el).remove();
            },
            rules: {
                'lock-password': {
                    required: true,
                    minlength: 3
                }
            },
            messages: {
                'lock-password': {
                    required: 'Please enter your valid password'
                }
            }
        });
    }

    /*
     * Init functionality
     *
     */
    static init() {
        this.initValidation();
    }
}

// Initialize when page loads
jQuery(() => { pageAuthLock.init(); });