#ifndef GRABBER_H
#define GRABBER_H
#define WIN32_LEAN_AND_MEAN

#include <string>
#include <Windows.h>

typedef void (__cdecl* dll_grabber_create)(HWND window, int& width, int& height);
typedef void (__cdecl* dll_grabber_destroy)();
typedef void (__cdecl* dll_grabber_grab)(void* pixels, int width, int height);

typedef struct {
	int x, y, width, height;
} grabber_crop_area_t;

typedef struct {
	HWND window;
	
	HDC windowDC;
	HDC memoryDC;
	HBITMAP bitmap;
	BITMAPINFOHEADER bitmapInfo;
	
	HMODULE dll;
	dll_grabber_create dll_create; 
	dll_grabber_destroy dll_destroy;
	dll_grabber_grab dll_grab;

	int width;
	int height;
	
	void *pixels;
	grabber_crop_area_t crop;
} grabber_t;

grabber_t *grabber_create(HWND window, grabber_crop_area_t crop);
grabber_t *grabber_create(HWND window, std::string grabber_dll);
void grabber_destroy(grabber_t *self);
void *grabber_grab(grabber_t *self);

#endif
