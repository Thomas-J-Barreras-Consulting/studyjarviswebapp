import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FileManagementComponent } from './file-management.component';
import { ApiService } from '../api.service';

describe('FileManagementComponent', () => {
  let component: FileManagementComponent;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    apiServiceSpy = jasmine.createSpyObj('ApiService', ['uploadFiles', 'prepareFiles']);

    await TestBed.configureTestingModule({
      imports: [FileManagementComponent],
      providers: [
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(FileManagementComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onFileChange should set selectedFiles from input event', () => {
    const dt = new DataTransfer();
    dt.items.add(new File(['content'], 'test.txt'));
    const event = { target: { files: dt.files } } as unknown as Event;
    component.onFileChange(event);
    expect(component.selectedFiles).toBeTruthy();
    expect(component.selectedFiles!.length).toBe(1);
  });

  it('uploadFiles should show "No files selected." when no files', () => {
    component.uploadFiles();
    expect(component.uploadMessage).toBe('No files selected.');
  });

  it('uploadFiles should set loading true during upload', () => {
    const dt = new DataTransfer();
    dt.items.add(new File(['content'], 'test.txt'));
    component.selectedFiles = dt.files;
    apiServiceSpy.uploadFiles.and.returnValue(of('ok'));

    component.uploadFiles();
    // After sync completion, loading should be false again
    expect(component.loading).toBeFalse();
  });

  it('uploadFiles should update uploadedFiles and message on success', () => {
    const dt = new DataTransfer();
    dt.items.add(new File(['a'], 'file1.txt'));
    dt.items.add(new File(['b'], 'file2.txt'));
    component.selectedFiles = dt.files;
    apiServiceSpy.uploadFiles.and.returnValue(of('ok'));

    component.uploadFiles();

    expect(component.uploadedFiles.length).toBe(2);
    expect(component.uploadedFiles[0].name).toBe('file1.txt');
    expect(component.uploadedFiles[1].name).toBe('file2.txt');
    expect(component.uploadMessage).toContain('Uploaded: 2');
    expect(component.uploadMessage).toContain('Failed: 0');
  });

  it('uploadFiles should set failure message on error', () => {
    const dt = new DataTransfer();
    dt.items.add(new File(['a'], 'file1.txt'));
    component.selectedFiles = dt.files;
    apiServiceSpy.uploadFiles.and.returnValue(throwError(() => new Error('fail')));

    component.uploadFiles();

    expect(component.uploadMessage).toContain('Failed: 1');
  });

  it('uploadFiles should set loading false after error', () => {
    const dt = new DataTransfer();
    dt.items.add(new File(['a'], 'file1.txt'));
    component.selectedFiles = dt.files;
    apiServiceSpy.uploadFiles.and.returnValue(throwError(() => new Error('fail')));

    component.uploadFiles();
    expect(component.loading).toBeFalse();
  });

  it('prepareFiles should call apiService.prepareFiles', () => {
    apiServiceSpy.prepareFiles.and.returnValue(of({}));
    component.prepareFiles();
    expect(apiServiceSpy.prepareFiles).toHaveBeenCalled();
  });

  it('prepareFiles should set success message on success', () => {
    apiServiceSpy.prepareFiles.and.returnValue(of({}));
    component.prepareFiles();
    expect(component.prepareMessage).toBe('Files prepared successfully!');
  });

  it('prepareFiles should set failure message on error', () => {
    apiServiceSpy.prepareFiles.and.returnValue(throwError(() => new Error('fail')));
    component.prepareFiles();
    expect(component.prepareMessage).toBe('File preparation failed.');
  });

  it('prepareFiles should set loading false after completion', () => {
    apiServiceSpy.prepareFiles.and.returnValue(of({}));
    component.prepareFiles();
    expect(component.loading).toBeFalse();
  });

  it('hasFailures should return true when message contains non-zero failures', () => {
    component.uploadMessage = 'Uploaded: 0, Failed: 2';
    expect(component.hasFailures()).toBeTrue();
  });

  it('hasFailures should return false when no failures', () => {
    component.uploadMessage = 'Uploaded: 2, Failed: 0';
    expect(component.hasFailures()).toBeFalse();
  });

  it('hasFailures should return false when message is empty', () => {
    component.uploadMessage = '';
    expect(component.hasFailures()).toBeFalse();
  });
});
