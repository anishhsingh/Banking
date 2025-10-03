import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BankingService } from './banking.service';
import { API_BASE } from '../config';

describe('BankingService', () => {
  let svc: BankingService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientTestingModule],
      providers:[BankingService]
    });
    svc = TestBed.inject(BankingService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(()=> http.verify());

  it('getAccounts with customerId attaches param', () => {
    svc.getAccounts(15).subscribe(list => {
      expect(list.length).toBe(1);
      expect(list[0].customerId).toBe(15);
    });
    const req = http.expectOne(r => r.url === `${API_BASE}/api/accounts` && r.params.get('customerId')==='15');
    req.flush([{ id:1, accountNumber:'AC1', customerId:15, accountType:'SAVINGS', balance:100, openedAt:'', status:'ACTIVE'}]);
  });

  it('deposit hits deposit endpoint', () => {
    svc.deposit(7, { amount:50 }).subscribe(acc => {
      expect(acc.id).toBe(7);
      expect(acc.balance).toBe(150);
    });
    const req = http.expectOne(`${API_BASE}/api/accounts/7/deposit`);
    req.flush({ id:7, accountNumber:'AC7', customerId:1, accountType:'SAVINGS', balance:150, openedAt:'', status:'ACTIVE'});
  });

  it('getAllTransactions hits aggregate endpoint', () => {
    svc.getAllTransactions().subscribe(txs => {
      expect(txs.length).toBe(2);
      expect(txs[0].txnType).toBe('DEPOSIT');
    });
    const req = http.expectOne(`${API_BASE}/api/accounts/transactions`);
    req.flush([
      { id:1, txnType:'DEPOSIT', amount:100, txnDate:'2024-01-01T00:00:00Z', note:'init' },
      { id:2, txnType:'WITHDRAWAL', amount:50, txnDate:'2024-01-02T00:00:00Z', note:'atm' }
    ]);
  });
});
