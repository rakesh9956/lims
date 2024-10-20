import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';


export class UsernameValidator {

    static cannotContainSpace(control: AbstractControl): ValidationErrors | null {

        // if ((control.value as string).indexOf(' ') >= 0) {

        //     return { cannotContainSpace: true }

        // }

        // return null;

        if (control.value?.startsWith(' ')) {

            if (/[a-zA-Z]/g.test(control.value)) {

                return null

            } else {

                return {

                    'trimError': { value: 'control has leading whitespace' }

                };

            }

        }

        // if (control.value.endsWith(' ')) {

        //     return {

        //         'trimError': { value: 'control has trailing whitespace' }

        //     };

        // }




        return null;

    }

}

export class FormValueTrimeer{
    static cleanForm(formgroup: any) {
        Object.keys(formgroup.controls).forEach((key) =>
            formgroup.get(key).setValue(
                formgroup.get(key).value == true ? formgroup.get(key).value :
                    formgroup.get(key).value == false ? formgroup.get(key).value :
                        formgroup.get(key).value == null ? formgroup.get(key).value :
                            /[a-zA-Z]/g.test(formgroup.get(key).value) == false ? formgroup.get(key).value :
                                formgroup.get(key).value == "" ? formgroup.get(key).value :
                                    (formgroup.get(key).value.toString()).trim()));

    }
}
