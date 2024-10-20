import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-shimmers',
  templateUrl: './shimmers.component.html',
  styleUrls: ['./shimmers.component.scss']
})
export class ShimmersComponent implements OnInit {

  // Display shimmer based on type
  @Input() type: string = "card"; // default

  // Table props
  @Input() cols: number = 5; // default
  @Input() rows: number = 5; // default
  // Table props

  // Card props
  @Input() repeat: number = 3; // default
  // Card props

  // Form props
  @Input() inputCount: number = 3; // default
  // Form props
  
  // Form2 props
  @Input() inputCount2: number = 4; // default
  // Form props

  constructor() { }

  ngOnInit(): void {
  }

}
