#include <stdio.h>
#include <assert.h>
#include "functions.h"

/* CMSC 216, Spring 2023, Project #1
 * Public test 2 (public2.c)
 *
 * Tests calling ith_factor(1, 1, 1).
 *
 * (c) Larry Herman, 2023.  You are allowed to use this code yourself, but
 * not to provide it to anyone else.
 */

int main(void) {
  assert(ith_factor(1, 1, 1) == 1);

  printf("\nThis test has passed!\n");

  return 0;
}
