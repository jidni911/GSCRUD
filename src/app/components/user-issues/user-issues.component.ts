import { Component, OnInit } from '@angular/core';
import { GscrudService } from 'src/app/services/gscrud.service';
import { UserIssues } from 'src/assets/models/UserIssues';
import * as XLSX from 'xlsx'; // install via npm i xlsx



@Component({
  selector: 'app-user-issues',
  templateUrl: './user-issues.component.html',
  styleUrls: ['./user-issues.component.scss']
})
export class UserIssuesComponent implements OnInit {

  sheetName = 'UserIssues';
  headers: string[] = [];
  issues: UserIssues[] = [];
  filteredIssues: UserIssues[] = [];
  loading = false;
  message: { type: 'success' | 'danger', text: string } | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Search
  searchText = '';

  // Form model
  newIssue: Partial<UserIssues> = {};

  constructor(private gs: GscrudService) {}

  ngOnInit(): void {
    this.loadIssues();
  }

  loadIssues() {
    this.loading = true;
    this.gs.getSheet(this.sheetName).subscribe({
      next: res => {
        const data: any[][] = res.data || [];
        if (data.length > 0) {
          this.headers = data[0];
          this.issues = data.slice(1).map(row => this.mapRowToIssue(row));
          this.applyFilter();
        }
        this.loading = false;
      },
      error: () => {
        this.showMessage('danger', 'Failed to load data.');
        this.loading = false;
      }
    });
  }

  private mapRowToIssue(row: any[]): UserIssues {
    return {
      id: +row[0],
      status: row[1],
      billDate: row[2],
      customerName: row[3],
      brand: row[4],
      model: row[5],
      serial: row[6],
      bill: +row[7],
      repairDescription: row[8],
      customerNameInPLO: row[9]
    };
  }

  private issueToRow(issue: UserIssues): any[] {
    return [
      issue.id,
      issue.status,
      issue.billDate,
      issue.customerName,
      issue.brand,
      issue.model,
      issue.serial,
      issue.bill,
      issue.repairDescription,
      issue.customerNameInPLO
    ];
  }

  addIssue() {
    const newId = this.issues.length ? Math.max(...this.issues.map(i => i.id)) + 1 : 1;
    const issue: UserIssues = {
      id: newId,
      status: this.newIssue.status || 'Pending',
      billDate: this.newIssue.billDate || new Date().toISOString().split('T')[0],
      customerName: this.newIssue.customerName || '',
      brand: this.newIssue.brand || '',
      model: this.newIssue.model || '',
      serial: this.newIssue.serial || '',
      bill: this.newIssue.bill || 0,
      repairDescription: this.newIssue.repairDescription || '',
      customerNameInPLO: this.newIssue.customerNameInPLO || ''
    };
    this.issues.push(issue);
    this.saveAll('Added new issue');
    this.newIssue = {};
    this.applyFilter();
  }

  updateIssue(issue: UserIssues) {
    this.saveAll('Issue updated');
  }

  deleteIssue(issue: UserIssues) {
    if (!confirm('Are you sure you want to delete this issue?')) return;
    this.issues = this.issues.filter(i => i.id !== issue.id);
    this.saveAll('Issue deleted');
    this.applyFilter();
  }

  private saveAll(msg?: string) {
    const data = [
      this.headers.length ? this.headers : [
        "id","status","billDate","customerName","brand","model","serial","bill","repairDescription","customerNameInPLO"
      ],
      ...this.issues.map(i => this.issueToRow(i))
    ];
    this.gs.updateSheet(this.sheetName, data).subscribe({
      next: () => this.showMessage('success', msg || 'Saved successfully'),
      error: () => this.showMessage('danger', 'Failed to save data')
    });
  }

  private showMessage(type: 'success' | 'danger', text: string) {
    this.message = { type, text };
    setTimeout(() => this.message = null, 3000);
  }

  /** ----------------- SEARCH & PAGINATION ----------------- */
  applyFilter() {
    if (!this.searchText) {
      this.filteredIssues = [...this.issues];
    } else {
      const term = this.searchText.toLowerCase();
      this.filteredIssues = this.issues.filter(i =>
        Object.values(i).some(val =>
          val?.toString().toLowerCase().includes(term)
        )
      );
    }
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.filteredIssues.length / this.pageSize);
  }

  get pagedIssues(): UserIssues[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredIssues.slice(start, start + this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  /** ----------------- EXPORT TO EXCEL ----------------- */
  exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.filteredIssues);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, this.sheetName);
    XLSX.writeFile(workbook, `${this.sheetName}.xlsx`);
  }
}
