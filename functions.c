#include "functions.h"
#include <stdio.h>

/* REMOVE THIS COMMENT, then write your implementations of the functions in
 * this source file. 
 * Skeleton versions of the functions already appear below.
 */

short compare_rectangles(int l1, int w1, int l2, int w2) {
  short a1 = l1 * w1;
  short a2 = l2 * w2;

  if (a1 > a2)
  {
    return (short) 1;
  }
  else if (a1 == a2)
  {
    return (short)  0;
  }
  else 
  {
    return (short) -1;
  }
}

/* use mod*/

int ith_factor(int a, int b, int i) {
  int count = 0;
  int smaller = 0;
  int factor = 0;

  if (a == 0 || b == 0 || i <= 0)
  {
    return -1;
  }


  if (a < b) 
  {
    smaller = a;
  }
  else
  {
    smaller = b;
  }

  for(factor = 0; factor <= smaller; factor++)
  {
    /* if factor is a factor of both a and b then increment count*/
      /* if mod is 0 for BOTH NUMBERS*/
    if (a % factor == 0 && b % factor == 0)
    {
      count ++;
      /* if count == i return the factor */
      if (count == i)
      {
        return factor;
      }

    } 
  }

  return -1;
}

long pell(short n) {
  int prev = 0;
  int prev_prev = 1;
  int pell = 0;
  int i = 2;

  if (n == 0 || n == 1){
    return n;
  }

  for (i = 2; i <= n-2; i ++)
  {
    pell = (2 * prev) + prev_prev;
    prev_prev = prev;
    prev = pell;
  }

  return pell;
}
