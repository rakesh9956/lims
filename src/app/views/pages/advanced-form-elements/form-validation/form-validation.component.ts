import { Component, OnInit } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-form-validation',
  templateUrl: './form-validation.component.html',
  styleUrls: ['./form-validation.component.scss']
})
export class FormValidationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

export class UsernameValidator {
    static cannotContainSpace(control: AbstractControl): ValidationErrors | null {
        // if ((control.value as string).indexOf(' ') >= 0) {
        //     return { cannotContainSpace: true }
        // }
        // return null;
        if (control.value.startsWith(' ')) {
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
